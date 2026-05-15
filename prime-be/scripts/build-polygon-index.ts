import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { performance } from 'node:perf_hooks';
import pLimit from 'p-limit';

type DataType = 'eupmeoundong' | 'sigungu';

type BoundingBox = {
  minX: number; // lng
  minY: number; // lat
  maxX: number; // lng
  maxY: number; // lat
};

type IndexEntry = {
    filePath: string;
    pnu: string;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    bytes: number;
};

type IndexFile = {
    version: number;
    generatedAt: string;
    dataType: DataType;
    basePath: string;
    entries: IndexEntry[];
    stats: {
        totalFiles: number;
        totalEntries: number;
        skippedTooLarge: number;
        skippedInvalid: number;
        elapsedMs: number;
        concurrency: number;
        maxFileMB: number;
        hostname: string;
    };
};

type Args = {
    types: DataType[];
    concurrency: number;
    maxFileMB: number;
    verbose: boolean;
};

function nowISO() {
    return new Date().toISOString();
}

function isDataType(v: string): v is DataType {
    return v === 'eupmeoundong' || v === 'sigungu';
}

function parseArgs(argv: string[]): Args {
    const args: Args = {
        types: [],
        concurrency: 4,
        maxFileMB: 50,
        verbose: false,
    };

    for (let i = 0; i < argv.length; i++) {
        const token = argv[i];

        if (token === '--types') {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --types');

        const raw = next
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const valid: DataType[] = [];
        for (const t of raw) {
            if (!isDataType(t)) {
            throw new Error(`Invalid argument "${t}". Use: eupmeoundong | sigungu`);
            }
            valid.push(t);
        }

        args.types = valid;
        i++;
        continue;
        }

        if (token === '--concurrency') {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --concurrency');
        args.concurrency = Math.max(1, Number(next));
        i++;
        continue;
        }

        if (token === '--max-file-mb') {
        const next = argv[i + 1];
        if (!next) throw new Error('Missing value for --max-file-mb');
        args.maxFileMB = Math.max(1, Number(next));
        i++;
        continue;
        }

        if (token === '--verbose') {
        args.verbose = true;
        continue;
        }
    }

    if (args.types.length === 0) {
        args.types = ['eupmeoundong', 'sigungu'];
    }

    return args;
}

function walkJsonFiles(dir: string): string[] {
    const out: string[] = [];
    if (!fs.existsSync(dir)) return out;

    const stack = [dir];
    while (stack.length) {
        const current = stack.pop()!;
        const items = fs.readdirSync(current);

        for (const item of items) {
        const p = path.join(current, item);
        const stat = fs.statSync(p);

        if (stat.isDirectory()) {
            stack.push(p);
            continue;
        }

        if (stat.isFile() && item.endsWith('.json')) {
            out.push(p);
        }
        }
    }
    return out;
}

function flattenCoordinates(coords: any): [number, number][] {
    if (Array.isArray(coords) && coords.length === 2 && typeof coords[0] === 'number') {
        return [coords as [number, number]];
    }

    if (!Array.isArray(coords)) return [];

    const res: [number, number][] = [];
    for (const c of coords) {
        res.push(...flattenCoordinates(c));
    }
    return res;
}

function calculateBoundingBoxFromGeoJSON(rawJson: string): BoundingBox | null {
    let json: any;
    try {
        json = JSON.parse(rawJson);
    } catch {
        return null;
    }

    if (!json?.features || !Array.isArray(json.features)) return null;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const feature of json.features) {
        const coords = feature?.geometry?.coordinates;
        if (!coords) continue;

        const flat = flattenCoordinates(coords);
        for (const [lng, lat] of flat) {
        if (typeof lng !== 'number' || typeof lat !== 'number') continue;

        minX = Math.min(minX, lng);
        minY = Math.min(minY, lat);
        maxX = Math.max(maxX, lng);
        maxY = Math.max(maxY, lat);
        }
    }

    if (
        minX === Infinity ||
        minY === Infinity ||
        maxX === -Infinity ||
        maxY === -Infinity
    ) {
        return null;
    }

    return { minX, minY, maxX, maxY };
}

function extractPrefix5FromPath(filePath: string): string {
    const m = filePath.replace(/\\/g, '/').match(/\/chunks\/(\d{5})\//);
    return m?.[1] ?? 'UNKNOWN';
}

function makeRelativeToRepoRoot(absPath: string) {
    const rel = path.relative(process.cwd(), absPath);
    return rel.replace(/\\/g, '/');
}

async function buildIndexForType(type: DataType, args: Args) {
    const POLYGON_DATA_ROOT =
        process.env.POLYGON_DATA_ROOT?.trim() || './src/data';

    const POLYGON_INDEX_DIR =
        process.env.POLYGON_INDEX_DIR?.trim() || './src/data/polygon/index';

    const chunksRoot = path.resolve(
        process.cwd(),
        POLYGON_DATA_ROOT,
        'polygon',
        type,
        'chunks',
    );

    const indexDir = path.resolve(process.cwd(), POLYGON_INDEX_DIR);

    if (!fs.existsSync(chunksRoot)) {
        throw new Error(`chunksRoot not found: ${chunksRoot}`);
    }

    fs.mkdirSync(indexDir, { recursive: true });

    const start = performance.now();

    const files = walkJsonFiles(chunksRoot);
    const limit = pLimit(args.concurrency);

    let skippedTooLarge = 0;
    let skippedInvalid = 0;

    const entries: IndexEntry[] = [];

    const maxBytes = args.maxFileMB * 1024 * 1024;

    await Promise.all(
        files.map((file) =>
        limit(async () => {
            try {
            const stat = await fs.promises.stat(file);
            if (stat.size > maxBytes) {
                skippedTooLarge++;
                if (args.verbose) {
                console.log(`[SKIP TOO LARGE] ${file} (${(stat.size / 1024 / 1024).toFixed(2)}MB)`);
                }
                return;
            }

            const raw = await fs.promises.readFile(file, 'utf8');
            const bbox = calculateBoundingBoxFromGeoJSON(raw);

            if (!bbox) {
                skippedInvalid++;
                if (args.verbose) console.log(`[SKIP INVALID] ${file}`);
                return;
            }

            const relPath = makeRelativeToRepoRoot(file);
            const pnu = extractPrefix5FromPath(file);

            entries.push({
                filePath: relPath,
                pnu,
                minX: bbox.minX,
                minY: bbox.minY,
                maxX: bbox.maxX,
                maxY: bbox.maxY,
                bytes: stat.size,
            });

            if (args.verbose) {
                console.log(`[OK] ${relPath} -> bbox(${bbox.minX},${bbox.minY},${bbox.maxX},${bbox.maxY})`);
            }
            } catch (e: any) {
            skippedInvalid++;
            if (args.verbose) {
                console.log(`[ERROR] ${file}`, e?.message);
            }
            }
        }),
        ),
    );

    entries.sort((a, b) => (a.filePath > b.filePath ? 1 : -1));

    const elapsedMs = Math.round(performance.now() - start);

    const output: IndexFile = {
        version: 1,
        generatedAt: nowISO(),
        dataType: type,
        basePath: makeRelativeToRepoRoot(chunksRoot),
        entries,
        stats: {
        totalFiles: files.length,
        totalEntries: entries.length,
        skippedTooLarge,
        skippedInvalid,
        elapsedMs,
        concurrency: args.concurrency,
        maxFileMB: args.maxFileMB,
        hostname: os.hostname(),
        },
    };

    const outPath = path.join(indexDir, `${type}.index.json`);
    await fs.promises.writeFile(outPath, JSON.stringify(output, null, 2), 'utf8');

    console.log(`\nindex generated: ${outPath}`);
    console.log(`- type: ${type}`);
    console.log(`- files: ${files.length}`);
    console.log(`- entries: ${entries.length}`);
    console.log(`- skippedTooLarge: ${skippedTooLarge}`);
    console.log(`- skippedInvalid: ${skippedInvalid}`);
    console.log(`- elapsed: ${elapsedMs}ms`);
    }

    async function main() {
    const args = parseArgs(process.argv.slice(2));

    console.log('build polygon index');
    console.log(`- types: ${args.types.join(', ')}`);
    console.log(`- concurrency: ${args.concurrency}`);
    console.log(`- maxFileMB: ${args.maxFileMB}`);
    console.log(`- verbose: ${args.verbose}`);
    console.log('');

    for (const type of args.types) {
        await buildIndexForType(type, args);
    }

    console.log('\ndone');
}

main().catch((e) => {
    console.error('build failed:', e?.message || e);
    process.exit(1);
});
