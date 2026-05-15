import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrency } from "../../redux/mapState";

const CURRENCIES = [
  {
    type: "KRW",
    label: "₩",
    icon: "ri-money-cny-circle-line",
    color: "bg-orange-500",
  },
  {
    type: "USD",
    label: "$",
    icon: "ri-money-dollar-circle-line",
    color: "bg-emerald-500",
  },
  {
    type: "USDT",
    label: "USDT",
    icon: "ri-coin-line",
    color: "bg-teal-500",
  },
];

/**
 * 통화 선택 컴포넌트
 * variant="default" : 아이콘 + 레이블 (헤더용)
 * variant="compact" : 레이블만 (공간이 좁은 곳)
 */
function CurrencySelector({ variant = "default" }) {
  const dispatch = useDispatch();
  const currency = useSelector((state) => state.map.currency);

  const handleSelect = (type) => {
    if (type !== currency) dispatch(setCurrency(type));
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        {CURRENCIES.map((c) => (
          <button
            key={c.type}
            onClick={() => handleSelect(c.type)}
            className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currency === c.type
                ? `${c.color} text-white shadow-md`
                : "text-gray-500 hover:bg-gray-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 shadow-inner">
      {CURRENCIES.map((c) => (
        <button
          key={c.type}
          onClick={() => handleSelect(c.type)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
            currency === c.type
              ? `${c.color} text-white shadow-lg`
              : "text-gray-600 hover:bg-white"
          }`}
        >
          <i className={c.icon}></i>
          {c.label}
        </button>
      ))}
    </div>
  );
}

export default CurrencySelector;
