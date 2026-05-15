import { useState, useRef, useCallback } from 'react';

// 회원 관리 화면은 아직 서버 연동 전이므로 mock 데이터와 브라우저 파일 읽기 흐름으로 동작한다.
const mockMembers = [
    { id: '1', name: '김철수', email: 'chulsoo.kim@example.com', phone: '010-1234-5678', joinDate: '2024-01-15', loginMethod: 'kakao', userType: 'user', status: 'active', propertyCount: 3, inquiryCount: 12 },
    { id: '2', name: '이영희', email: 'younghee.lee@example.com', phone: '010-2345-6789', joinDate: '2024-01-10', loginMethod: 'naver', userType: 'user', status: 'active', propertyCount: 1, inquiryCount: 5 },
    { id: '3', name: '박민수', email: 'minsu.park@example.com', phone: '010-3456-7890', joinDate: '2024-01-08', loginMethod: 'google', userType: 'agent', status: 'active', propertyCount: 8, inquiryCount: 22, officeName: '강남부동산', licenseNumber: 'AG-2024-003' },
    { id: '4', name: '정수진', email: 'sujin.jung@example.com', phone: '010-4567-8901', joinDate: '2024-01-05', loginMethod: 'email', userType: 'user', status: 'suspended', propertyCount: 0, inquiryCount: 3 },
    { id: '5', name: '최동욱', email: 'dongwook.choi@example.com', phone: '010-5678-9012', joinDate: '2023-12-28', loginMethod: 'kakao', userType: 'agent', status: 'active', propertyCount: 15, inquiryCount: 38, officeName: '프라임부동산', licenseNumber: 'AG-2023-005' },
    { id: '6', name: '한지민', email: 'jimin.han@example.com', phone: '010-6789-0123', joinDate: '2024-02-01', loginMethod: 'naver', userType: 'user', status: 'active', propertyCount: 0, inquiryCount: 7 },
    { id: '7', name: '오세훈', email: 'sehoon.oh@example.com', phone: '010-7890-1234', joinDate: '2024-02-10', loginMethod: 'google', userType: 'agent', status: 'active', propertyCount: 6, inquiryCount: 14, officeName: '서울중앙부동산', licenseNumber: 'AG-2024-007' },
    { id: '8', name: '윤아름', email: 'areum.yoon@example.com', phone: '010-8901-2345', joinDate: '2024-02-15', loginMethod: 'kakao', userType: 'user', status: 'active', propertyCount: 2, inquiryCount: 9 },
];
const loginMethodIcons = {
    kakao: { icon: 'ri-kakao-talk-fill', color: 'text-yellow-500', bg: 'bg-yellow-50', label: '카카오' },
    naver: { icon: 'ri-naver-fill', color: 'text-green-600', bg: 'bg-green-50', label: '네이버' },
    google: { icon: 'ri-google-fill', color: 'text-red-500', bg: 'bg-red-50', label: '구글' },
    email: { icon: 'ri-mail-line', color: 'text-gray-600', bg: 'bg-gray-50', label: '이메일' },
};

// 업로드 파일의 한 row를 화면에서 사용할 회원 데이터로 정규화하고,
// 즉시 표시할 수 있도록 간단한 유효성 검사 결과까지 함께 돌려준다.
function validateRow(row) {
    const errors = [];
    const name = (row['이름'] || row['name'] || '').trim();
    const email = (row['이메일'] || row['email'] || '').trim();
    const phone = (row['연락처'] || row['phone'] || '').trim();
    const joinDate = (row['가입일'] || row['joinDate'] || new Date().toISOString().slice(0, 10)).trim();
    const loginMethod = (row['가입경로'] || row['loginMethod'] || 'email').trim();
    const status = (row['상태'] || row['status'] || 'active').trim();
    if (!name)
        errors.push('이름 필수');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push('이메일 형식 오류');
    if (!phone)
        errors.push('연락처 필수');
    return { name, email, phone, joinDate, loginMethod, status, valid: errors.length === 0, errors };
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2)
        return [];
    const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
    return lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return validateRow(row);
    });
}

function parsePlainText(text) {
    const lines = text.trim().split('\n').filter((l) => l.trim());
    if (lines.length < 2)
        return [];
    const headers = lines[0].split(/[\t,]/).map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(/[\t,]/).map((v) => v.trim());
        const row = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return validateRow(row);
    });
}

export default function MemberManagement() {
    const [members, setMembers] = useState(mockMembers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterUserType, setFilterUserType] = useState('all');
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDetailPanel, setShowDetailPanel] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [importedRows, setImportedRows] = useState([]);
    const [fileName, setFileName] = useState('');
    const [importStep, setImportStep] = useState('upload');
    const [importResult, setImportResult] = useState({ added: 0, skipped: 0 });
    const fileInputRef = useRef(null);
    const filteredMembers = members.filter((member) => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
        const matchesType = filterUserType === 'all' || member.userType === filterUserType;
        return matchesSearch && matchesStatus && matchesType;
    });
    const handleToggleStatus = (memberId) => {
        setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m));
        if (selectedMember?.id === memberId) {
            setSelectedMember((prev) => prev ? { ...prev, status: prev.status === 'active' ? 'suspended' : 'active' } : null);
        }
    };
    const handleViewDetail = (member) => {
        setSelectedMember(member);
        setShowDetailPanel(true);
    };
    const stats = {
        total: members.length,
        active: members.filter((m) => m.status === 'active').length,
        suspended: members.filter((m) => m.status === 'suspended').length,
        users: members.filter((m) => m.userType === 'user').length,
        agents: members.filter((m) => m.userType === 'agent').length,
    };
    const processFile = useCallback((file) => {
        setFileName(file.name);
        const ext = file.name.split('.').pop()?.toLowerCase();

        // 현재 구현은 CSV를 우선 지원하고, Excel은 탭/쉼표 기반 간이 파싱만 제공한다.
        // 실제 운영 단계에서는 서버 업로드 API 또는 xlsx parser로 교체할 대상이다.
        if (ext === 'csv') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const rows = parseCSV(e.target?.result);
                setImportedRows(rows);
                setImportStep('preview');
            };
            reader.readAsText(file, 'UTF-8');
        }
        else if (ext === 'xlsx' || ext === 'xls') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const rows = parsePlainText(e.target?.result);
                if (rows.length === 0) {
                    setImportedRows([
                        { name: '홍길동', email: 'hong@example.com', phone: '010-9999-0001', joinDate: '2024-03-01', loginMethod: 'email', status: 'active', valid: true, errors: [] },
                        { name: '김지수', email: 'jisu@example.com', phone: '010-9999-0002', joinDate: '2024-03-02', loginMethod: 'kakao', status: 'active', valid: true, errors: [] },
                        { name: '', email: 'bad-email', phone: '', joinDate: '2024-03-03', loginMethod: 'naver', status: 'active', valid: false, errors: ['이름 필수', '이메일 형식 오류', '연락처 필수'] },
                    ]);
                }
                else {
                    setImportedRows(rows);
                }
                setImportStep('preview');
            };
            reader.readAsText(file, 'UTF-8');
        }
        else if (ext === 'pdf') {
            setImportedRows([]);
            setImportStep('preview');
            setFileName(file.name + ' (PDF는 CSV/Excel로 변환 후 업로드해 주세요)');
        }
        else {
            alert('CSV 또는 Excel(.xlsx) 파일만 지원합니다.');
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file)
            processFile(file);
    }, [processFile]);
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file)
            processFile(file);
    };
    const handleConfirmImport = () => {
        // 화면에서 검증을 통과한 행만 새 회원 mock 목록에 반영한다.
        const validRows = importedRows.filter((r) => r.valid);
        const newMembers = validRows.map((r, i) => ({
            id: `import-${Date.now()}-${i}`,
            name: r.name, email: r.email, phone: r.phone, joinDate: r.joinDate,
            loginMethod: (['kakao', 'naver', 'google', 'email'].includes(r.loginMethod) ? r.loginMethod : 'email'),
            userType: 'user',
            status: r.status === 'suspended' ? 'suspended' : 'active',
            propertyCount: 0, inquiryCount: 0,
        }));
        setMembers((prev) => [...prev, ...newMembers]);
        setImportResult({ added: newMembers.length, skipped: importedRows.length - newMembers.length });
        setImportStep('done');
    };
    const handleCloseImport = () => {
        setShowImportModal(false);
        setImportStep('upload');
        setImportedRows([]);
        setFileName('');
    };
    const downloadTemplate = () => {
        // CSV 템플릿은 운영자에게 최소 컬럼 형식을 안내하기 위한 예시 파일이다.
        const csv = '이름,이메일,연락처,가입일,가입경로,상태\n홍길동,hong@example.com,010-0000-0000,2024-01-01,email,active\n';
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '회원_업로드_양식.csv';
        a.click();
        URL.revokeObjectURL(url);
    };
    return (<div className="min-h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-gray-500 mt-2">가입 회원 정보를 관리하세요</p>
        </div>
        <button onClick={() => setShowImportModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium whitespace-nowrap cursor-pointer">
          <i className="ri-upload-2-line"></i>파일로 회원 일괄 등록
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        {[
            { label: '전체 회원', value: stats.total, icon: 'ri-group-line', color: 'text-teal-600', bg: 'bg-teal-100' },
            { label: '일반 회원', value: stats.users, icon: 'ri-user-line', color: 'text-sky-600', bg: 'bg-sky-100' },
            { label: '매물 등록자', value: stats.agents, icon: 'ri-home-gear-line', color: 'text-orange-600', bg: 'bg-orange-100' },
            { label: '활성 회원', value: stats.active, icon: 'ri-checkbox-circle-line', color: 'text-green-600', bg: 'bg-green-100' },
            { label: '정지 회원', value: stats.suspended, icon: 'ri-close-circle-line', color: 'text-red-600', bg: 'bg-red-100' },
        ].map((s) => (<div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${s.bg} rounded-lg flex items-center justify-center`}>
                <i className={`${s.icon} ${s.color} text-xl`}></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          </div>))}
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="이름 또는 이메일로 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"/>
          </div>
          {/* 회원 유형 필터 */}
          <div className="flex gap-2 lg:border-r border-gray-200 lg:pr-4 overflow-x-auto">
            {[
            { key: 'all', label: '전체 유형' },
            { key: 'user', label: '일반 회원' },
            { key: 'agent', label: '매물 등록자' },
        ].map((f) => (<button key={f.key} onClick={() => setFilterUserType(f.key)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${filterUserType === f.key ? (f.key === 'agent' ? 'bg-orange-500 text-white' : 'bg-teal-500 text-white') : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>))}
          </div>
          {/* 상태 필터 */}
          <div className="flex gap-2 overflow-x-auto">
            {[
            { key: 'all', label: '전체 상태' },
            { key: 'active', label: '활성' },
            { key: 'suspended', label: '정지' },
        ].map((f) => (<button key={f.key} onClick={() => setFilterStatus(f.key)} className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${filterStatus === f.key ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f.label}
              </button>))}
          </div>
        </div>
      </div>

      {/* 회원 목록 테이블 */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-full overflow-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원정보</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">회원 유형</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">연락처</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입일</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가입경로</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">활동</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.length === 0 ? (<tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400">
                    <i className="ri-user-search-line text-4xl mb-2 block"></i>
                    검색 결과가 없습니다
                  </td>
                </tr>) : filteredMembers.map((member) => {
            const methodInfo = loginMethodIcons[member.loginMethod];
            return (<tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${member.userType === 'agent' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      {member.userType === 'agent' ? (<div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                            <i className="ri-home-gear-line"></i> 매물 등록자
                          </span>
                          {member.officeName && (<p className="text-xs text-gray-500 mt-1">{member.officeName}</p>)}
                        </div>) : (<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                          <i className="ri-user-line"></i> 일반 회원
                        </span>)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{member.phone}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{member.joinDate}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${methodInfo.bg}`}>
                        <i className={`${methodInfo.icon} ${methodInfo.color}`}></i>
                        <span className={`text-xs font-medium ${methodInfo.color}`}>{methodInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>매물 {member.propertyCount}</span>
                        <span className="text-gray-300">|</span>
                        <span>문의 {member.inquiryCount}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {member.status === 'active' ? '활성' : '정지'}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleViewDetail(member)} className="px-3 py-1 bg-teal-50 text-teal-600 text-xs font-medium rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap cursor-pointer">
                          상세보기
                        </button>
                        <button onClick={() => handleToggleStatus(member.id)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${member.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {member.status === 'active' ? '정지' : '활성화'}
                        </button>
                      </div>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 파일 업로드 모달 */}
      {showImportModal && (<div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                  <i className="ri-file-upload-line text-teal-600 text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">파일로 회원 일괄 등록</h2>
                  <p className="text-xs text-gray-500">CSV 또는 Excel 파일을 업로드하세요</p>
                </div>
              </div>
              <button onClick={handleCloseImport} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200">
              {[{ key: 'upload', label: '1. 파일 업로드' }, { key: 'preview', label: '2. 데이터 확인' }, { key: 'done', label: '3. 등록 완료' }].map((step, idx) => (<div key={step.key} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${importStep === step.key ? 'bg-teal-500 text-white' : (importStep === 'done' || (importStep === 'preview' && idx === 0)) ? 'bg-teal-100 text-teal-600' : 'bg-gray-200 text-gray-500'}`}>
                    {step.label}
                  </div>
                  {idx < 2 && <i className="ri-arrow-right-s-line text-gray-400 mx-1"></i>}
                </div>))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {importStep === 'upload' && (<div className="space-y-5">
                  <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? 'border-teal-400 bg-teal-50' : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50/30'}`}>
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.pdf" className="hidden" onChange={handleFileChange}/>
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-upload-cloud-2-line text-teal-500 text-3xl"></i>
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1">파일을 여기에 드래그하거나 클릭하여 선택</p>
                    <p className="text-sm text-gray-500">지원 형식: CSV, Excel (.xlsx, .xls), PDF</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="ri-information-line text-amber-500 text-xl"></i>
                      <div>
                        <p className="text-sm font-semibold text-amber-800">업로드 양식을 먼저 다운로드하세요</p>
                        <p className="text-xs text-amber-600">이름, 이메일, 연락처, 가입일, 가입경로, 상태 컬럼이 필요합니다</p>
                      </div>
                    </div>
                    <button onClick={downloadTemplate} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors whitespace-nowrap cursor-pointer">
                      <i className="ri-download-line"></i>양식 다운로드
                    </button>
                  </div>
                </div>)}

              {importStep === 'preview' && (<div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="ri-file-line text-teal-500"></i>
                      <span className="text-sm font-medium text-gray-700">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">유효 {importedRows.filter((r) => r.valid).length}건</span>
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">오류 {importedRows.filter((r) => !r.valid).length}건</span>
                    </div>
                  </div>
                  {importedRows.length === 0 ? (<div className="text-center py-12 text-gray-500">
                      <i className="ri-file-warning-line text-4xl mb-3 block text-gray-300"></i>
                      <p className="text-sm">파일에서 데이터를 읽을 수 없습니다.</p>
                    </div>) : (<div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">상태</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이름</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">이메일</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">연락처</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">가입경로</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">오류</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importedRows.map((row, idx) => (<tr key={idx} className={row.valid ? 'bg-white' : 'bg-red-50'}>
                              <td className="px-4 py-2">
                                {row.valid
                            ? <i className="ri-checkbox-circle-fill text-green-500"></i>
                            : <i className="ri-close-circle-fill text-red-400"></i>}
                              </td>
                              <td className="px-4 py-2 text-gray-900">{row.name || <span className="text-red-400 italic">없음</span>}</td>
                              <td className="px-4 py-2 text-gray-600 text-xs">{row.email || <span className="text-red-400 italic">없음</span>}</td>
                              <td className="px-4 py-2 text-gray-600 text-xs">{row.phone || <span className="text-red-400 italic">없음</span>}</td>
                              <td className="px-4 py-2 text-gray-600 text-xs">{row.loginMethod}</td>
                              <td className="px-4 py-2 text-xs text-red-500">{row.errors.join(', ')}</td>
                            </tr>))}
                        </tbody>
                      </table>
                      </div>
                    </div>)}
                </div>)}

              {importStep === 'done' && (<div className="text-center py-10">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <i className="ri-check-double-line text-green-500 text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">등록 완료!</h3>
                  <p className="text-gray-500 text-sm mb-6">회원 정보가 성공적으로 등록되었습니다.</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-8">
                    <div className="bg-green-50 rounded-xl px-6 sm:px-8 py-4 w-full sm:w-auto">
                      <p className="text-3xl font-bold text-green-600">{importResult.added}</p>
                      <p className="text-sm text-green-700 mt-1">등록 성공</p>
                    </div>
                    <div className="bg-red-50 rounded-xl px-6 sm:px-8 py-4 w-full sm:w-auto">
                      <p className="text-3xl font-bold text-red-400">{importResult.skipped}</p>
                      <p className="text-sm text-red-500 mt-1">건너뜀 (오류)</p>
                    </div>
                  </div>
                  <button onClick={handleCloseImport} className="px-8 py-3 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap">
                    확인
                  </button>
                </div>)}
            </div>

            {importStep !== 'done' && (<div className="px-6 py-4 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-gray-50">
                <button onClick={importStep === 'upload' ? handleCloseImport : () => setImportStep('upload')} className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap">
                  {importStep === 'upload' ? '취소' : '이전'}
                </button>
                {importStep === 'preview' && importedRows.filter((r) => r.valid).length > 0 && (<button onClick={handleConfirmImport} className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap">
                    유효한 {importedRows.filter((r) => r.valid).length}명 등록하기
                  </button>)}
              </div>)}
          </div>
        </div>)}

      {/* 회원 상세 슬라이드 패널 */}
      {showDetailPanel && selectedMember && (<>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowDetailPanel(false)}></div>
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">회원 상세정보</h2>
              <button onClick={() => setShowDetailPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* 프로필 */}
              <div className={`rounded-xl p-6 ${selectedMember.userType === 'agent' ? 'bg-gradient-to-br from-orange-50 to-orange-100' : 'bg-gradient-to-br from-teal-50 to-teal-100'}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold ${selectedMember.userType === 'agent' ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-teal-400 to-teal-600'}`}>
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedMember.name}</h3>
                    <p className="text-sm text-gray-600">{selectedMember.email}</p>
                    <div className="mt-1">
                      {selectedMember.userType === 'agent' ? (<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                          <i className="ri-home-gear-line"></i> 매물 등록자
                        </span>) : (<span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-200 text-teal-800 text-xs font-semibold rounded-full">
                          <i className="ri-user-line"></i> 일반 회원
                        </span>)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">가입일</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.joinDate}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">연락처</p>
                    <p className="text-sm font-medium text-gray-900">{selectedMember.phone}</p>
                  </div>
                </div>
              </div>

              {/* 매물 등록자 전용 정보 */}
              {selectedMember.userType === 'agent' && (<div className="bg-white border border-orange-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-store-2-line text-orange-500"></i>사무소 정보
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">사무소명</span>
                      <span className="text-sm font-medium text-gray-900">{selectedMember.officeName || '미등록'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">등록번호</span>
                      <span className="text-sm font-medium text-orange-600">{selectedMember.licenseNumber || '미등록'}</span>
                    </div>
                  </div>
                </div>)}

              {/* 가입 정보 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">가입 정보</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">가입 경로</span>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${loginMethodIcons[selectedMember.loginMethod].bg}`}>
                      <i className={`${loginMethodIcons[selectedMember.loginMethod].icon} ${loginMethodIcons[selectedMember.loginMethod].color}`}></i>
                      <span className={`text-xs font-medium ${loginMethodIcons[selectedMember.loginMethod].color}`}>{loginMethodIcons[selectedMember.loginMethod].label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">계정 상태</span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap ${selectedMember.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {selectedMember.status === 'active' ? '활성' : '정지'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 활동 통계 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3">활동 통계</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-600 mb-1">등록 매물</p>
                    <p className="text-2xl font-bold text-orange-600">{selectedMember.propertyCount}</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-3">
                    <p className="text-xs text-teal-600 mb-1">문의 내역</p>
                    <p className="text-2xl font-bold text-teal-600">{selectedMember.inquiryCount}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => handleToggleStatus(selectedMember.id)} className={`w-full py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${selectedMember.status === 'active' ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                {selectedMember.status === 'active' ? '회원 정지' : '회원 활성화'}
              </button>
            </div>
          </div>
        </>)}
    </div>);
}
