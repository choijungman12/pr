import React, { useMemo, useState } from "react";
import { consentRequirements, landOwnerData } from "../../data/landOwnerData";

export default function ConsentManagementPanel({
  onClose,
  developmentType,
  onOwnerSelect,
}) {
  const [owners, setOwners] = useState(landOwnerData);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConsentRequestModal, setShowConsentRequestModal] = useState(false);
  const [selectedOwnerForRequest, setSelectedOwnerForRequest] = useState(null);
  const [bulkSendMode, setBulkSendMode] = useState(false);
  const [selectedOwnerIds, setSelectedOwnerIds] = useState([]);
  const [sendingStatus, setSendingStatus] = useState("idle");

  const requirement = consentRequirements[developmentType];
  const devTypeLabel =
    developmentType === "urbanDevelopment"
      ? "도시개발추진위"
      : developmentType === "redevelopment"
      ? "재개발추진위"
      : "재건축추진위";

  const consentStats = useMemo(() => {
    const totalOwners = owners.length;
    const agreedOwners = owners.filter((o) => o.consentStatus === "agreed");
    const disagreedOwners = owners.filter((o) => o.consentStatus === "disagreed");
    const pendingOwners = owners.filter((o) => o.consentStatus === "pending");

    const totalArea = owners.reduce((sum, o) => sum + o.area, 0);
    const agreedArea = agreedOwners.reduce((sum, o) => sum + o.area, 0);

    const ownerConsentRatio = (agreedOwners.length / totalOwners) * 100;
    const areaConsentRatio = (agreedArea / totalArea) * 100;

    return {
      totalOwners,
      agreedOwners: agreedOwners.length,
      disagreedOwners: disagreedOwners.length,
      pendingOwners: pendingOwners.length,
      totalArea,
      agreedArea,
      ownerConsentRatio,
      areaConsentRatio,
      canFormCommittee: areaConsentRatio >= requirement.minConsentRatio,
    };
  }, [owners, requirement.minConsentRatio]);

  const filteredOwners = useMemo(() => {
    return owners.filter((owner) => {
      const matchesStatus =
        filterStatus === "all" || owner.consentStatus === filterStatus;
      const matchesSearch =
        owner.name.includes(searchTerm) ||
        owner.parcelNumber.includes(searchTerm) ||
        owner.address.includes(searchTerm);
      return matchesStatus && matchesSearch;
    });
  }, [owners, filterStatus, searchTerm]);

  const handleConsentChange = (ownerId, newStatus) => {
    setOwners((prev) =>
      prev.map((owner) =>
        owner.id === ownerId ? { ...owner, consentStatus: newStatus } : owner
      )
    );
  };

  const handleOwnerClick = (ownerId) => {
    if (onOwnerSelect) onOwnerSelect(ownerId);
  };

  const handleOpenConsentRequest = (owner) => {
    setSelectedOwnerForRequest(owner);
    setBulkSendMode(false);
    setShowConsentRequestModal(true);
    setSendingStatus("idle");
  };

  const handleOpenBulkSend = () => {
    const pendingAndDisagreed = owners
      .filter((o) => o.consentStatus !== "agreed")
      .map((o) => o.id);
    setSelectedOwnerIds(pendingAndDisagreed);
    setBulkSendMode(true);
    setSelectedOwnerForRequest(null);
    setShowConsentRequestModal(true);
    setSendingStatus("idle");
  };

  const toggleOwnerSelection = (ownerId) => {
    setSelectedOwnerIds((prev) =>
      prev.includes(ownerId)
        ? prev.filter((id) => id !== ownerId)
        : [...prev, ownerId]
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "agreed":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">
            동의
          </span>
        );
      case "disagreed":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
            반대
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
            미응답
          </span>
        );
    }
  };

  return (
    <>
      <div className="absolute right-4 top-20 w-[480px] h-[calc(100vh-160px)] bg-white rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <i className="ri-user-follow-line text-xl text-white"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">지주 동의율 관리</h2>
              <p className="text-xs text-gray-500">{devTypeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenBulkSend}
              className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:shadow-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <i className="ri-mail-send-line"></i>
              일괄 발송
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl text-gray-600"></i>
            </button>
          </div>
        </div>

        {consentStats.canFormCommittee && (
          <div className="mx-4 mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-checkbox-circle-fill text-2xl text-white"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  추진위 구성 가능
                </h3>
                <p className="text-sm text-green-700">
                  {requirement.minConsentRatio}% 동의율을 달성했습니다!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="px-4 pt-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-user-line text-blue-600"></i>
                <span className="text-sm font-medium text-gray-600">지주 동의율</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {consentStats.ownerConsentRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {consentStats.agreedOwners}/{consentStats.totalOwners}명 동의
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-map-pin-line text-purple-600"></i>
                <span className="text-sm font-medium text-gray-600">면적 동의율</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {consentStats.areaConsentRatio.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {consentStats.agreedArea.toFixed(0)}㎡/
                {consentStats.totalArea.toFixed(0)}㎡
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">목표 달성률</span>
              <span className="text-sm font-bold text-purple-600">
                {Math.min(
                  100,
                  (consentStats.areaConsentRatio / requirement.minConsentRatio) *
                    100
                ).toFixed(0)}
                %
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  consentStats.canFormCommittee
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                }`}
                style={{
                  width: `${Math.min(
                    100,
                    (consentStats.areaConsentRatio / requirement.minConsentRatio) *
                      100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">
                현재: {consentStats.areaConsentRatio.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">
                목표: {requirement.minConsentRatio}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
              <input
                type="text"
                placeholder="지주명, 번지 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div className="flex gap-1">
              {[
                { key: "all", label: "전체", count: consentStats.totalOwners },
                { key: "agreed", label: "동의", count: consentStats.agreedOwners },
                { key: "pending", label: "미응답", count: consentStats.pendingOwners },
                {
                  key: "disagreed",
                  label: "반대",
                  count: consentStats.disagreedOwners,
                },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    filterStatus === f.key
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {f.label}({f.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {filteredOwners.map((owner) => (
              <div
                key={owner.id}
                className="bg-white border border-gray-200 hover:border-purple-300 rounded-xl p-3 transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => handleOwnerClick(owner.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        owner.consentStatus === "agreed"
                          ? "bg-green-100"
                          : owner.consentStatus === "disagreed"
                          ? "bg-red-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <i
                        className={`text-sm ${
                          owner.consentStatus === "agreed"
                            ? "ri-check-line text-green-600"
                            : owner.consentStatus === "disagreed"
                            ? "ri-close-line text-red-600"
                            : "ri-time-line text-gray-500"
                        }`}
                      ></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold text-gray-800">
                          {owner.name}
                        </span>
                        {getStatusBadge(owner.consentStatus)}
                      </div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {owner.address}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {owner.area}㎡ · 지분 {owner.shareRatio}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleConsentChange(owner.id, "agreed")}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        owner.consentStatus === "agreed"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600"
                      }`}
                      title="동의"
                    >
                      <i className="ri-check-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleConsentChange(owner.id, "disagreed")}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        owner.consentStatus === "disagreed"
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                      }`}
                      title="반대"
                    >
                      <i className="ri-close-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => handleOpenConsentRequest(owner)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all cursor-pointer"
                      title="동의 요청서 발송"
                    >
                      <i className="ri-mail-send-line text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-gray-50">
          <div className="flex items-start gap-2">
            <i className="ri-information-line text-gray-500 mt-0.5 text-sm"></i>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-gray-600">
                {requirement.legalBasis}
              </p>
              <p className="text-[10px] text-gray-500">
                {requirement.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showConsentRequestModal && (
        <ConsentRequestModal
          owner={selectedOwnerForRequest}
          bulkMode={bulkSendMode}
          owners={owners}
          selectedOwnerIds={selectedOwnerIds}
          onToggleOwner={toggleOwnerSelection}
          developmentType={devTypeLabel}
          sendingStatus={sendingStatus}
          onSend={setSendingStatus}
          onClose={() => {
            setShowConsentRequestModal(false);
            setSelectedOwnerForRequest(null);
            setBulkSendMode(false);
            setSelectedOwnerIds([]);
            setSendingStatus("idle");
          }}
        />
      )}
    </>
  );
}

function ConsentRequestModal({
  owner,
  bulkMode,
  owners,
  selectedOwnerIds,
  onToggleOwner,
  developmentType,
  sendingStatus,
  onSend,
  onClose,
}) {
  const [requestMessage, setRequestMessage] = useState(
    `안녕하세요.\n\n${developmentType} 구성을 위한 토지소유자 동의 요청서를 보내드립니다.\n\n본 사업은 해당 구역의 체계적인 개발을 통해 토지 가치 상승과 주거환경 개선을 목표로 하고 있습니다.\n\n동의서 작성에 참여해 주시면 감사하겠습니다.\n\n자세한 사항은 추진위원회 사무실로 문의해 주세요.`
  );
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderEmail, setSenderEmail] = useState("");

  const targetOwners = bulkMode
    ? owners.filter((o) => selectedOwnerIds.includes(o.id))
    : owner
    ? [owner]
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!senderName.trim() || !senderPhone.trim()) return;
    if (targetOwners.length === 0) return;

    onSend("sending");

    const formData = new URLSearchParams();
    formData.append("발송유형", bulkMode ? "일괄발송" : "개별발송");
    formData.append("추진위유형", developmentType);
    formData.append("발송인이름", senderName);
    formData.append("발송인연락처", senderPhone);
    if (senderEmail) formData.append("email", senderEmail);
    formData.append(
      "수신대상",
      targetOwners.map((o) => `${o.name}(${o.parcelNumber})`).join(", ")
    );
    formData.append("수신인수", `${targetOwners.length}명`);
    formData.append("요청메시지", requestMessage);

    try {
      const response = await fetch(
        "https://readdy.ai/api/form/d6c6g32tehdqnvnpi9d0",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }
      );
      onSend(response.ok ? "success" : "error");
    } catch {
      onSend("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <i className="ri-mail-send-line text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold">동의 요청서 발송</h3>
              <p className="text-xs text-white/70">
                {bulkMode
                  ? `${selectedOwnerIds.length}명 일괄 발송`
                  : owner
                  ? `${owner.name}님에게 발송`
                  : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-lg transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {sendingStatus === "success" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-check-double-line text-4xl text-green-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">발송 완료!</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              {targetOwners.length}명의 지주에게 동의 요청서가
              <br />
              성공적으로 발송되었습니다.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              확인
            </button>
          </div>
        ) : sendingStatus === "error" ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i className="ri-error-warning-line text-4xl text-red-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">발송 실패</h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              요청서 발송 중 오류가 발생했습니다.
              <br />
              잠시 후 다시 시도해 주세요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onSend("idle")}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors cursor-pointer whitespace-nowrap"
              >
                다시 시도
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <form
            id="consent-request-form"
            data-readdy-form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto"
          >
            <div className="p-5 space-y-4">
              {bulkMode && (
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-2 block">
                    수신 대상 선택 ({selectedOwnerIds.length}명)
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1">
                    {owners
                      .filter((o) => o.consentStatus !== "agreed")
                      .map((o) => (
                        <label
                          key={o.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedOwnerIds.includes(o.id)}
                            onChange={() => onToggleOwner(o.id)}
                            className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-800">
                                {o.name}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  o.consentStatus === "disagreed"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {o.consentStatus === "disagreed"
                                  ? "반대"
                                  : "미응답"}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {o.address}
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {o.area}㎡
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              )}

              {!bulkMode && owner && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-bold text-gray-700 mb-2">
                    수신자 정보
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">이름</span>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {owner.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">번지</span>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {owner.parcelNumber}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">면적</span>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {owner.area}㎡
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">지분율</span>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {owner.shareRatio}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="text-xs font-bold text-gray-700 mb-2">
                  발송인 정보
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 mb-1 block">
                      이름 *
                    </label>
                    <input
                      type="text"
                      name="senderName"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="발송인 이름"
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">
                        연락처 *
                      </label>
                      <input
                        type="tel"
                        name="senderPhone"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="010-0000-0000"
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 mb-1 block">
                        이메일
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 mb-2 block">
                  동의 요청 메시지
                </label>
                <textarea
                  name="requestMessage"
                  value={requestMessage}
                  onChange={(e) => {
                    if (e.target.value.length <= 500) {
                      setRequestMessage(e.target.value);
                    }
                  }}
                  maxLength={500}
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none leading-relaxed"
                ></textarea>
                <div className="text-[10px] text-gray-400 text-right mt-1">
                  {requestMessage.length}/500자
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <i className="ri-information-line text-amber-600 mt-0.5"></i>
                  <div className="text-[10px] text-amber-700 leading-relaxed">
                    <div className="font-bold mb-1">발송 안내</div>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>동의 요청서는 등록된 연락처로 발송됩니다</li>
                      <li>발송 후 지주의 응답 상태가 자동으로 업데이트됩니다</li>
                      <li>
                        법적 효력이 있는 동의서는 별도 서면 절차가 필요합니다
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={
                  sendingStatus === "sending" ||
                  targetOwners.length === 0 ||
                  !senderName.trim() ||
                  !senderPhone.trim()
                }
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingStatus === "sending" ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    발송 중...
                  </>
                ) : (
                  <>
                    <i className="ri-mail-send-line"></i>
                    {targetOwners.length}명에게 발송
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
