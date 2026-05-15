import React, { useState } from "react";
import { getRequirementsByType } from "../../data/developmentRequirements";

export default function RequirementCheckPanel({ onClose }) {
  const [selectedType, setSelectedType] = useState("redevelop");
  const requirements = getRequirementsByType(selectedType);

  const getStatusColor = (status) => {
    switch (status) {
      case "possible":
        return "from-green-500 to-emerald-600";
      case "conditional":
        return "from-yellow-500 to-orange-600";
      case "impossible":
        return "from-red-500 to-rose-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "possible":
        return "추진 가능";
      case "conditional":
        return "조건부 가능";
      case "impossible":
        return "추진 불가";
      default:
        return "검토 필요";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "possible":
        return "ri-checkbox-circle-fill";
      case "conditional":
        return "ri-error-warning-fill";
      case "impossible":
        return "ri-close-circle-fill";
      default:
        return "ri-question-fill";
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "important":
        return "text-orange-600 bg-orange-50";
      case "normal":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getImportanceText = (importance) => {
    switch (importance) {
      case "critical":
        return "필수";
      case "important":
        return "중요";
      case "normal":
        return "일반";
      default:
        return "";
    }
  };

  const criticalMet = requirements.requirements.filter(
    (r) => r.importance === "critical" && r.isMet
  ).length;
  const criticalTotal = requirements.requirements.filter(
    (r) => r.importance === "critical"
  ).length;
  const importantMet = requirements.requirements.filter(
    (r) => r.importance === "important" && r.isMet
  ).length;
  const importantTotal = requirements.requirements.filter(
    (r) => r.importance === "important"
  ).length;

  return (
    <div className="absolute left-20 top-4 bottom-4 w-[480px] bg-white rounded-2xl shadow-2xl z-30 flex flex-col overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <i className="ri-file-list-3-line text-xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold">개발 요건 충족 여부</h2>
            <p className="text-xs text-indigo-100">법적 요건 자동 판단 시스템</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl"></i>
        </button>
      </div>

      <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType("redevelop")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedType === "redevelop"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-building-line mr-1"></i>
            재개발
          </button>
          <button
            onClick={() => setSelectedType("rebuild")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedType === "rebuild"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-home-gear-line mr-1"></i>
            재건축
          </button>
          <button
            onClick={() => setSelectedType("urban")}
            className={`flex-1 py-2.5 px-3 rounded-xl font-medium text-sm transition-all cursor-pointer whitespace-nowrap ${
              selectedType === "urban"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <i className="ri-community-line mr-1"></i>
            도시개발
          </button>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div
          className={`bg-gradient-to-r ${getStatusColor(
            requirements.overallStatus
          )} rounded-2xl p-4 text-white shadow-lg`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <i
                  className={`${getStatusIcon(
                    requirements.overallStatus
                  )} text-2xl`}
                ></i>
              </div>
              <div>
                <div className="text-xs opacity-90 mb-1">종합 판정 결과</div>
                <div className="text-xl font-bold">
                  {getStatusText(requirements.overallStatus)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-90 mb-1">충족률</div>
              <div className="text-3xl font-bold">{requirements.overallScore}%</div>
            </div>
          </div>

          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{ width: `${requirements.overallScore}%` }}
            ></div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="opacity-90">
              필수 요건: {criticalMet}/{criticalTotal}
            </span>
            <span className="opacity-90">
              중요 요건: {importantMet}/{importantTotal}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <i className="ri-checkbox-multiple-line text-indigo-600"></i>
          세부 요건 체크리스트
        </div>

        <div className="space-y-3">
          {requirements.requirements.map((req) => (
            <div
              key={req.id}
              className={`bg-white border-2 rounded-xl p-4 transition-all ${
                req.isMet
                  ? "border-green-200 hover:border-green-300"
                  : "border-red-200 hover:border-red-300"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">
                      {req.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getImportanceColor(
                        req.importance
                      )}`}
                    >
                      {getImportanceText(req.importance)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {req.description}
                  </p>
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    req.isMet ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <i
                    className={`${
                      req.isMet
                        ? "ri-check-line text-green-600"
                        : "ri-close-line text-red-600"
                    } text-lg`}
                  ></i>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-500 mb-1">요구 기준</div>
                  <div className="text-xs font-bold text-gray-800">
                    {req.required}
                  </div>
                </div>
                <div
                  className={`rounded-lg p-2 ${
                    req.isMet ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="text-xs text-gray-500 mb-1">현재 상태</div>
                  <div
                    className={`text-xs font-bold ${
                      req.isMet ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {req.current}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {requirements.recommendations.length > 0 && (
          <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <i className="ri-lightbulb-line text-white"></i>
              </div>
              <span className="text-sm font-bold text-gray-800">
                보완 방안 및 권고사항
              </span>
            </div>
            <div className="space-y-2">
              {requirements.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 text-xs text-gray-700 leading-relaxed"
                >
                  <i className="ri-arrow-right-s-line text-amber-600 mt-0.5 flex-shrink-0"></i>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
