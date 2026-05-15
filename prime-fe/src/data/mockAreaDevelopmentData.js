export const areaDevelopmentDetails = {
  gangnam: {
    id: 'area1', name: '강남구', district: '강남', region: '서울 남부',
    position: { lat: 37.5050, lng: 127.0450 }, area: '39.5㎢', population: '570,000명',
    developments: [
      {
        name: '강남역 신개발지역', type: '복합개발', status: '진행중',
        expectedCompletion: 2026, scale: '25,000㎡'
      },
      {
        name: '청담 고급주거지', type: '주거개발', status: '진행중',
        expectedCompletion: 2025, scale: '18,000㎡'
      },
      {
        name: '논현 프로젝트', type: '주거개발', status: '계획단계',
        expectedCompletion: 2027, scale: '22,000㎡'
      }
    ],
    economy: {
      avgPrice: 800, pricePerPyeong: '8,500만원', growthRate: 3.2,
      marketShare: '22%', futureOutlook: '우호적'
    },
    infrastructure: {
      subwayLines: 4, busRoutes: 85, parks: 12, schools: 42
    }
  },
  jamsil: {
    id: 'area2', name: '송파구 잠실동', district: '송파', region: '서울 동부',
    position: { lat: 37.5145, lng: 127.0850 }, area: '8.2㎢', population: '280,000명',
    developments: [
      {
        name: '잠실 한강 오피스텔', type: '오피스텔개발', status: '완공',
        completionYear: 2019, scale: '450세대'
      },
      {
        name: '잠실 랜드마크', type: '복합개발', status: '진행중',
        expectedCompletion: 2026, scale: '35,000㎡'
      },
      {
        name: '잠실 리버사이드', type: '주거개발', status: '계획단계',
        expectedCompletion: 2028, scale: '20,000㎡'
      }
    ],
    economy: {
      avgPrice: 650, pricePerPyeong: '7,200만원', growthRate: 2.8,
      marketShare: '18%', futureOutlook: '보통'
    },
    infrastructure: {
      subwayLines: 2, busRoutes: 65, parks: 8, schools: 35
    }
  },
  yongsan: {
    id: 'area3', name: '용산구 이촌동', district: '용산', region: '서울 중부',
    position: { lat: 37.5324, lng: 126.9906 }, area: '7.5㎢', population: '220,000명',
    developments: [
      {
        name: '이촌 한강뷰', type: '고급주거', status: '계획단계',
        expectedCompletion: 2027, scale: '28,000㎡'
      },
      {
        name: '용산 국제비즈니스존', type: '오피스개발', status: '진행중',
        expectedCompletion: 2025, scale: '45,000㎡'
      },
      {
        name: '용산 문화플렉스', type: '문화시설', status: '진행중',
        expectedCompletion: 2026, scale: '15,000㎡'
      }
    ],
    economy: {
      avgPrice: 720, pricePerPyeong: '8,000만원', growthRate: 2.5,
      marketShare: '15%', futureOutlook: '우호적'
    },
    infrastructure: {
      subwayLines: 3, busRoutes: 55, parks: 9, schools: 28
    }
  }
};

export function getAreaDevelopmentByPosition(lat, lng) {
  const areas = Object.values(areaDevelopmentDetails);
  let nearestArea = null;
  let minDistance = Infinity;

  for (const area of areas) {
    const dx = area.position.lat - lat;
    const dy = area.position.lng - lng;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance) {
      minDistance = distance;
      nearestArea = area;
    }
  }

  return nearestArea || null;
}

export function getAreaDevelopmentByDistrict(district) {
  const areaKeys = Object.keys(areaDevelopmentDetails);

  for (const key of areaKeys) {
    const area = areaDevelopmentDetails[key];
    if (area.district === district || area.name.includes(district)) {
      return area;
    }
  }

  return null;
}
