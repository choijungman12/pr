import { useState, useRef, useEffect } from 'react';

function AIChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요! 부동산 AI 상담사입니다. 아파트, 빌라, 토지, 오피스텔에 대해 무엇이든 물어보세요.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const suggestedQuestions = [
    { icon: 'ri-money-dollar-circle-line', text: '해당 아파트 평균 가격은?' },
    { icon: 'ri-building-line', text: '이 지역 도시기본계획은?' },
    { icon: 'ri-line-chart-line', text: '미래가치 분석해줘' },
    { icon: 'ri-map-pin-line', text: '주변 학군/상권/병원 정보' },
    { icon: 'ri-shopping-bag-line', text: '네이버 매물 시세 비교' },
    { icon: 'ri-stock-line', text: '향후 시세 예측' },
  ];

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('가격') || lowerQuestion.includes('시세')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '강남구 대치동 은마아파트 84㎡ 기준 시세 분석 결과입니다.',
        timestamp: new Date(),
        data: {
          priceAnalysis: {
            average: 185000,
            min: 165000,
            max: 205000,
            median: 182000,
          },
        },
      };
    }

    if (lowerQuestion.includes('도시') || lowerQuestion.includes('계획')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '강남구 대치동 일대 도시기본계획 정보입니다.',
        timestamp: new Date(),
        data: {
          urbanPlan: {
            title: '대치동 재정비촉진지구 지정',
            description: '2025년 재정비촉진지구로 지정 예정이며, 향후 5년 내 재개발 착수 계획이 있습니다.',
            impact: '재개발 시 용적률 상향으로 인한 가치 상승 예상',
          },
        },
      };
    }

    if (lowerQuestion.includes('미래') || lowerQuestion.includes('예측')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: 'AI 기반 미래가치 분석 결과입니다.',
        timestamp: new Date(),
        data: {
          futureValue: {
            score: 87,
            trend: '상승',
            prediction: '향후 3년간 연평균 8.5% 상승 예상. 재개발 호재와 GTX 개통으로 인한 교통 접근성 개선이 주요 요인입니다.',
          },
        },
      };
    }

    if (lowerQuestion.includes('학군') || lowerQuestion.includes('상권') || lowerQuestion.includes('병원')) {
      return {
        id: Date.now().toString(),
        type: 'ai',
        content: '주변 인프라 분석 결과입니다.',
        timestamp: new Date(),
        data: {
          infrastructure: {
            schools: [
              { name: '대치초등학교', distance: '350m', rating: 4.8 },
              { name: '대치중학교', distance: '580m', rating: 4.6 },
              { name: '휘문고등학교', distance: '720m', rating: 4.9 },
            ],
            commercial: {
              score: 92,
              description: '대형마트 2개, 편의점 15개, 음식점 120개 이상. 은마상가 및 대치동 먹자골목 인접',
            },
            hospitals: [
              { name: '삼성서울병원', distance: '2.1km', type: '종합병원' },
              { name: '대치동내과의원', distance: '180m', type: '내과' },
              { name: '대치연세치과', distance: '220m', type: '치과' },
            ],
          },
        },
      };
    }

    return {
      id: Date.now().toString(),
      type: 'ai',
      content: '해당 질문에 대한 상세 분석을 진행하고 있습니다. 구체적인 지역이나 매물을 선택하시면 더 정확한 정보를 제공해드릴 수 있습니다.',
      timestamp: new Date(),
    };
  };

  const handleSendMessage = (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = generateAIResponse(messageText);
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full bg-white flex flex-col shadow-2xl">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-robot-2-line text-white text-xl"></i>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">AI 매물 상담</h2>
            <p className="text-xs text-gray-500">부동산 전문 AI 어시스턴트</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* Suggested Questions */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-medium text-gray-600 mb-3">추천 질문</p>
        <div className="grid grid-cols-2 gap-2">
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q.text)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-all cursor-pointer text-left flex items-center gap-2 whitespace-nowrap"
            >
              <i className={`${q.icon} text-sm`}></i>
              <span className="truncate">{q.text}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {/* Data Visualization */}
              {message.data?.priceAnalysis && (
                <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">평균가</span>
                    <span className="text-lg font-bold text-orange-600">
                      {message.data.priceAnalysis.average.toLocaleString()}만원
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">최저가</span>
                      <span className="font-semibold text-blue-600">
                        {message.data.priceAnalysis.min.toLocaleString()}만원
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">최고가</span>
                      <span className="font-semibold text-red-600">
                        {message.data.priceAnalysis.max.toLocaleString()}만원
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">중위값</span>
                      <span className="font-semibold text-gray-900">
                        {message.data.priceAnalysis.median.toLocaleString()}만원
                      </span>
                    </div>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-orange-500 to-red-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              )}

              {message.data?.futureValue && (
                <div className="mt-3 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">미래가치 점수</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-orange-600">
                        {message.data.futureValue.score}
                      </span>
                      <span className="text-xs text-gray-500">/100</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <i className="ri-arrow-up-line text-green-600"></i>
                    <span className="text-sm font-semibold text-green-600">
                      {message.data.futureValue.trend} 추세
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {message.data.futureValue.prediction}
                  </p>
                </div>
              )}

              {message.data?.infrastructure && (
                <div className="mt-3 space-y-3">
                  {/* Schools */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-school-line text-orange-600"></i>
                      <span className="text-sm font-semibold text-gray-900">학군 정보</span>
                    </div>
                    <div className="space-y-2">
                      {message.data.infrastructure.schools.map((school, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{school.name}</span>
                            <span className="text-gray-500">{school.distance}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-yellow-500 text-xs"></i>
                            <span className="font-semibold text-gray-700">{school.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Commercial */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className="ri-shopping-bag-line text-orange-600"></i>
                        <span className="text-sm font-semibold text-gray-900">상권 분석</span>
                      </div>
                      <span className="text-lg font-bold text-orange-600">
                        {message.data.infrastructure.commercial.score}점
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {message.data.infrastructure.commercial.description}
                    </p>
                  </div>

                  {/* Hospitals */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <i className="ri-hospital-line text-orange-600"></i>
                      <span className="text-sm font-semibold text-gray-900">의료 시설</span>
                    </div>
                    <div className="space-y-2">
                      {message.data.infrastructure.hospitals.map((hospital, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{hospital.name}</span>
                            <span className="text-gray-500">{hospital.distance}</span>
                          </div>
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                            {hospital.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {message.data?.urbanPlan && (
                <div className="mt-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-building-line text-blue-600"></i>
                    <span className="text-sm font-semibold text-gray-900">
                      {message.data.urbanPlan.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-2 leading-relaxed">
                    {message.data.urbanPlan.description}
                  </p>
                  <div className="flex items-start gap-2 bg-blue-100 rounded-lg p-2">
                    <i className="ri-information-line text-blue-600 text-sm mt-0.5"></i>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {message.data.urbanPlan.impact}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-1 px-1">
                {message.timestamp.toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="궁금한 내용을 입력하세요..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-orange-500 text-sm"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            className="w-11 h-11 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-nowrap"
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 text-center">
          AI가 제공하는 정보는 참고용이며, 실제 투자 결정 시 전문가 상담을 권장합니다.
        </p>
      </div>
    </div>
  );
}

export default AIChatPanel;
