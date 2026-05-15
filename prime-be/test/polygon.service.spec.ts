const { PolygonController } = require('src/polygon/controller/polygon.controller');
const { Test, TestingModule } = require('@nestjs/testing');
const { ConfigService } = require('@nestjs/config');
const { PolygonServiceImpl } = require('../src/polygon/service/polygon.serviceImpl');
const { boundsRes, pointRes } = require('../src/polygon/dto/polygon.dto');
const Exception = require('../src/common/exception/service/service.exception');

describe('PolygonServiceImpl', () => {
  let service: { 
    searchPolygonsStreaming: (arg0: { neLat: number; neLng: number; swLat: number; swLng: number; }) => typeof boundsRes[];
    findPolygonsInBounds: (arg0: { neLat: number; neLng: number; swLat: number; swLng: number; }) => typeof boundsRes[];
    isValidCoordinate: (arg0: { lat: number; lng: number; }) => boolean;
    searchPolygonsForPoint: (arg0: { lat: number; lng: number; }) => typeof pointRes;
    findPolygonsInPoint: (arg0: { lat: number; lng: number; }) => typeof pointRes;
    getSigunguPolygons: (arg0: { neLat: number; neLng: number; swLat: number; swLng: number; }) => any[];
    getEupmeoundongPolygons: (arg0: { neLat: number; neLng: number; swLat: number; swLng: number; }) => any[];
  };

  beforeEach(async () => {
    const module: typeof TestingModule = await Test.createTestingModule({
      providers: [
        PolygonServiceImpl,
        ConfigService,
      ],
    }).compile();

    service = module.get(PolygonServiceImpl);
  });

  describe('좌표 유효성 검사테스트', () => {
    it('잘못된 좌표 Request 테스트', async () => {
      service.searchPolygonsStreaming = jest.fn().mockResolvedValue([]);

      const boundsRequest = {
        neLat: -337.50561605,
        neLng: -127.0574484,
        swLat: -337.5019921,
        swLng: -12337.0494071,
      };

      await expect(service.findPolygonsInBounds(boundsRequest)).rejects.toThrow(
        Exception.BadRequestException('위도(lat)는 -90에서 90 사이여야 합니다. 받은 값: lat=-337.50561605')
      );
    });
    it('함수호출횟수, 설정한 인자로 호출', async () => {
      service.isValidCoordinate = jest.fn();
      const isValidCoordinateSpy = service.isValidCoordinate;

      service.searchPolygonsStreaming = jest.fn().mockResolvedValue([
        { properties: { PNU: '11110' }, coordinates: [[126.9750, 37.5650]] }
      ]);

      const boundsRequest = {
        neLat: 37.5665,
        neLng: 126.9780,
        swLat: 37.5600,
        swLng: 126.9700,
      };

      await service.findPolygonsInBounds(boundsRequest);

      expect(isValidCoordinateSpy).toHaveBeenCalledTimes(2);
      expect(isValidCoordinateSpy).toHaveBeenCalledWith(126.9780, 37.5665);
      expect(isValidCoordinateSpy).toHaveBeenCalledWith(126.9700, 37.5600);
    });
  });

  describe('findPolygonsInBounds', () => {
    it('화면 범위로 폴리곤 찾기 성공테스트', async () => {
      const mockPolygons = [
        {
          pnu: "1168010100107080041",
          coordinates: [[127.04859207193674,37.504114591089966],[127.0488498651716,37.50419368581906],[127.04896856220292,37.50393162793859],
          [127.04871438944858,37.50385361321622],[127.04859207193674,37.504114591089966]],
          areaName: "서울특별시 강남구 역삼동",
          landBookName: "일반",
          jibunNum: "708-41",
          landType: "대",
          landArea: 749.9,
          useLandName1: "일반상업지역",
          useLandName2: "지정되지않음",
          useLandState: "상업용",
          landHeight: "평지",
          landShape: "세로장방",
          loadShape: "광대로한면",
          landPrice: 57930000,
          asisPrices: {
              price1: 57030000,
              price2: 60300000,
              price3: 52050000,
              price4: 49900000
          },
          realEstatePrices: {
              dealingGbn: "직거래",
              deals: [
                  {
                      dealAmount: "15,247,505",
                      dealYear: 2022,
                      dealMonth: 5,
                      dealDay: 12,
                      estateAgentSggNm: "",
                      shareDealingType: "",
                      cDealType: "",
                      cDealDay: ""
                  }
              ]
          },
          createdAt: "2024-04-02T00:00:00",
          shareState: "법인",
          sharePeople: 1,
          ageRange: "구분없음",
          liveState: "구분없음",
          nationState: "ZZ",
          diffShareState: "소유권이전",
          diffShareDay: "20220812"
      },
      {
          pnu: "1168010100107080007",
          coordinates: [[127.0488498651716,37.50419368581906],[127.04889477259817,37.504207453089116],[127.04899789192325,37.50417056086487],
          [127.04909276432114,37.5039697803076],[127.04896856220292,37.50393162793859],[127.0488498651716,37.50419368581906]],
          areaName: "서울특별시 강남구 역삼동",
          landBookName: "일반",
          jibunNum: "708-7",
          landType: "대",
          landArea: 332.1,
          useLandName1: "일반상업지역",
          useLandName2: "지정되지않음",
          useLandState: "상업나지",
          landHeight: "평지",
          landShape: "세로장방",
          loadShape: "광대소각",
          landPrice: 66040000,
          asisPrices: {
              price1: 65010000,
              price2: 68740000,
              price3: 59850000,
              price4: 50440000
          },
          realEstatePrices: {
              dealingGbn: "직거래",
              deals: [
                  {
                      dealAmount: "6,752,495",
                      dealYear: 2022,
                      dealMonth: 5,
                      dealDay: 12,
                      estateAgentSggNm: "",
                      shareDealingType: "",
                      cDealType: "",
                      cDealDay: ""
                  }
              ]
          },
          createdAt: "2024-04-02T00:00:00",
          shareState: "법인",
          sharePeople: 1,
          ageRange: "구분없음",
          liveState: "구분없음",
          nationState: "ZZ",
          diffShareState: "소유권이전",
          diffShareDay: "20220812"
        }
      ];

      service.searchPolygonsStreaming = jest.fn().mockResolvedValue(mockPolygons);

      const boundsRequest = {
        neLat: 37.50561605,
        neLng: 127.0574484,
        swLat: 37.5019921,
        swLng: 127.0494071,
      };

      const result = await service.findPolygonsInBounds(boundsRequest);

      expect(result).toHaveLength(2);
      expect(result[0].pnu).toBe('1168010100107080041');
      expect(result[0].areaName).toBe('서울특별시 강남구 역삼동');
      expect(result[0].coordinates).toEqual(expect.arrayContaining([[127.04859207193674,37.504114591089966],[127.0488498651716,37.50419368581906],[127.04896856220292,37.50393162793859],
        [127.04871438944858,37.50385361321622],[127.04859207193674,37.504114591089966]]));
      expect(result[0].landBookName).toBe('일반');
      expect(result[0].landType).toBe('대');
      expect(result[0].landArea).toBe(749.9);
      expect(result[0].landPrice).toBe(57930000);
      expect(result[0].landHeight).toBe('평지');
      expect(result[0].landShape).toBe('세로장방');
      expect(result[0].loadShape).toBe('광대로한면');
      expect(result[0].useLandName1).toBe('일반상업지역');
      expect(result[0].useLandName2).toBe('지정되지않음');
      expect(result[0].useLandState).toBe('상업용');
      expect(result[0].shareState).toBe('법인');
      expect(result[0].sharePeople).toBe(1);
      expect(result[0].ageRange).toBe('구분없음');
      expect(result[0].liveState).toBe('구분없음');
      expect(result[0].nationState).toBe('ZZ');
      expect(result[0].diffShareState).toBe('소유권이전');
      expect(result[0].diffShareDay).toBe('20220812');

      expect(result[1].pnu).toBe('1168010100107080007');
      expect(result[1].areaName).toBe('서울특별시 강남구 역삼동');
      expect(result[1].coordinates).toEqual(expect.arrayContaining([[127.0488498651716,37.50419368581906],[127.04889477259817,37.504207453089116],[127.04899789192325,37.50417056086487],
        [127.04909276432114,37.5039697803076],[127.04896856220292,37.50393162793859],[127.0488498651716,37.50419368581906]]));
      expect(result[1].landBookName).toBe('일반');
      expect(result[1].landType).toBe('대');
      expect(result[1].landArea).toBe(332.1);
      expect(result[1].landPrice).toBe(66040000);
      expect(result[1].landHeight).toBe('평지');
      expect(result[1].landShape).toBe('세로장방');
      expect(result[1].loadShape).toBe('광대소각');
      expect(result[1].useLandName1).toBe('일반상업지역');
      expect(result[1].useLandName2).toBe('지정되지않음');
      expect(result[1].useLandState).toBe('상업나지');
      expect(result[1].shareState).toBe('법인');
      expect(result[1].sharePeople).toBe(1);
      expect(result[1].ageRange).toBe('구분없음');
      expect(result[1].liveState).toBe('구분없음');
      expect(result[1].nationState).toBe('ZZ');
      expect(result[1].diffShareState).toBe('소유권이전');
      expect(result[1].diffShareDay).toBe('20220812');
    });
  });

  describe('findPolygonsInPoint', () => {
    it('클릭한 곳 포함하는 폴리곤 찾기 성공테스트', async () => {
      const mockPointPolygons = [
          {
            pnu: "1117012900103010162",
            coordinates: [[126.98292177786023, 37.51861143202717],
            [126.98292104898957, 37.51863127184362],
            [126.9829221787627, 37.5186368942363],
            [126.98292177786023, 37.51861143202717],
            [126.98292104898957, 37.51863127184362],
            ],
            areaName: "서울특별시 용산구 이촌동",
            landBookName: "일반",
            jibunNum: "301-162",
            landType: "대",
            landArea: 14091,
            useLandName1: "제3종일반주거지역",
            useLandName2: "지정되지않음",
            useLandState: "아파트",
            landHeight: "평지",
            landShape: "부정형",
            loadShape: "광대소각",
            landPrice: 12530000,
            asisPrices: {
              price1: 12460000,
              price2: 14000000,
              price3: 12850000,
              price4: 12000000
            },
            realEstatePrices: null,
            createdAt: "2024-04-02T00:00:00",
            shareState: "",
            sharePeople: 507,
            ageRange: "",
            liveState: "",
            nationState: "",
            diffShareState: "",
            diffShareDay: ""
          }
      ];

      service.searchPolygonsForPoint = jest.fn().mockResolvedValue(mockPointPolygons);

      const pointRequest = {
        lat: 37.517988388742204,
        lng: 126.98240185973927,
      };

      const result = await service.findPolygonsInPoint(pointRequest);

      expect(result).toHaveLength(1);
      expect(result[0].pnu).toBe('1117012900103010162');
      expect(result[0].areaName).toBe('서울특별시 용산구 이촌동');
      expect(result[0].coordinates).toEqual(expect.arrayContaining([
        [126.98292177786023, 37.51861143202717],
        [126.98292104898957, 37.51863127184362],
        [126.9829221787627, 37.5186368942363],
        [126.98292177786023, 37.51861143202717],
        [126.98292104898957, 37.51863127184362],
      ]));
      expect(result[0].landBookName).toBe('일반');
      expect(result[0].landType).toBe('대');
      expect(result[0].landArea).toBe(14091);
      expect(result[0].useLandName1).toBe('제3종일반주거지역');
      expect(result[0].useLandName2).toBe('지정되지않음');
      expect(result[0].useLandState).toBe('아파트');
      expect(result[0].landHeight).toBe('평지');
      expect(result[0].landShape).toBe('부정형');
      expect(result[0].loadShape).toBe('광대소각');
      expect(result[0].landPrice).toBe(12530000);
      expect(result[0].jibunNum).toBe('301-162');
      expect(result[0].shareState).toBe('');
      expect(result[0].sharePeople).toBe(507);
      expect(result[0].ageRange).toBe('');
      expect(result[0].liveState).toBe('');
      expect(result[0].nationState).toBe('');
      expect(result[0].diffShareState).toBe('');
      expect(result[0].diffShareDay).toBe('');
    });
  });

  describe('getSigunguPolygons', () => {
    it('시군구 폴리곤 찾기 성공테스트', async () => {
      const mockSigunguPolygons = [
        {
          sigunguCode: "11680",
          sigunguName: "강남구",
          coordinates: [
            [
              [127.04859207193674, 37.504114591089966],
              [127.0488498651716, 37.50419368581906],
              [127.04896856220292, 37.50393162793859],
              [127.04871438944858, 37.50385361321622],
              [127.04859207193674, 37.504114591089966]
            ]
          ]
        }
      ];

      service.getSigunguPolygons = jest.fn().mockResolvedValue(mockSigunguPolygons);

      const boundsRequest = {
        neLat: 37.50561605,
        neLng: 127.0574484,
        swLat: 37.5019921,
        swLng: 127.0494071,
      };

      const result = await service.getSigunguPolygons(boundsRequest);

      expect(result).toHaveLength(1);
      expect(result[0].sigunguCode).toBe('11680');
      expect(result[0].sigunguName).toBe('강남구');
      expect(result[0].coordinates).toEqual(expect.arrayContaining([
        [
          [127.04859207193674, 37.504114591089966],
          [127.0488498651716, 37.50419368581906],
          [127.04896856220292, 37.50393162793859],
          [127.04871438944858, 37.50385361321622],
          [127.04859207193674, 37.504114591089966]
        ]
      ]));
    });
  });

  describe('getEupmeoundongPolygons', () => {
    it('읍면동 폴리곤 찾기 성공테스트', async () => {
      const mockEupmeoundongPolygons = [
        {
          eupmeondongCode: "1168010100",
          eupmeondongName: "역삼동",
          coordinates: [
            [
              [127.04859207193674, 37.504114591089966],
              [127.0488498651716, 37.50419368581906],
              [127.04896856220292, 37.50393162793859],
              [127.04871438944858, 37.50385361321622],
              [127.04859207193674, 37.504114591089966]
            ]
          ]
        }
      ];

      service.getEupmeoundongPolygons = jest.fn().mockResolvedValue(mockEupmeoundongPolygons);

      const boundsRequest = {
        neLat: 37.50561605,
        neLng: 127.0574484,
        swLat: 37.5019921,
        swLng: 127.0494071,
      };

      const result = await service.getEupmeoundongPolygons(boundsRequest);

      expect(result).toHaveLength(1);
      expect(result[0].eupmeondongCode).toBe('1168010100');
      expect(result[0].eupmeondongName).toBe('역삼동');
      expect(result[0].coordinates).toEqual(expect.arrayContaining([
        [
          [127.04859207193674, 37.504114591089966],
          [127.0488498651716, 37.50419368581906],
          [127.04896856220292, 37.50393162793859],
          [127.04871438944858, 37.50385361321622],
          [127.04859207193674, 37.504114591089966]
        ]
      ]));
    });
  });
});
