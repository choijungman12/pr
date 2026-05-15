import { Injectable } from '@nestjs/common';
import { GeocodingRequestDto, GeocodingResponseDto } from '../dto/geocoding.dto';
import { ReverseGeocodingRequestDto, ReverseGeocodingResponseDto } from '../dto/reverse.geocoding.dto';
import { Logger } from '@nestjs/common';
import axios from 'axios';

/**
 * @author 심판교(Simpangyo) <spg@returnplus.kr>
 * @version 1.0.0
 */
@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);
  private readonly NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
  private readonly NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;
  private readonly NAVER_GEOCODING_URL =
    'https://maps.apigw.ntruss.com/map-geocode/v2/geocode';
  private readonly NAVER_REVERSE_GEOCODING_URL =
    'https://maps.apigw.ntruss.com/map-reversegeocode/v2/gc';

  private extractAddress(data: any) {
    const addrResult = data;
    let address = '';
    for (let idx = 1; idx < Object.keys(addrResult.region).length; idx++) {
      const areaName = addrResult.region[`area${idx}`].name;
      if (areaName) {
          address += areaName + ' ';
      }
    }
    const { number1, number2 } = addrResult.land;
    address += number2 ? `${number1}-${number2}` : number1;

    return address.trim();
  }

  private extractRoadAddress(data: any) {
    const roadResult = data;
    let roadAddress = '';
    for (let idx = 1; idx < Object.keys(roadResult.region).length; idx++) {
      const areaName = roadResult.region[`area${idx}`].name;
      if (areaName) {
          roadAddress += areaName + ' ';
      }
    }
    const { name, number1, number2 } = roadResult.land;
    if (name) {
        roadAddress += name + ' ';
    }
    roadAddress += number2 ? `${number1}-${number2}` : number1;

    return roadAddress.trim();
  }

  async getCoordinates(dto: GeocodingRequestDto): Promise<GeocodingResponseDto | {}> {
    try {
      const response = await axios.get(this.NAVER_GEOCODING_URL, {
        params: {
          query: dto.address,
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.NAVER_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': this.NAVER_CLIENT_SECRET,
        },
      });
      console.log("response:", response.data)

      if (!response.data.addresses || response.data.addresses.length === 0) {
        return {} 
        // throw new Error('No results found for the given address');
      }

      const result = response.data.addresses[0];
      // console.log("result:", result)
      return {
        latitude: parseFloat(result.y),
        longitude: parseFloat(result.x),
        address: result.roadAddress || result.jibunAddress,
      };
    } catch (error) {
      this.logger.error(`요청 실패 : ${error.message}`);
      if (error.response) {
        this.logger.error(
          `실패 응답 데이터: ${JSON.stringify(error.response.data)}`,
        );
        this.logger.error(`실패 응답 상태: ${error.response.status}`);
      }
      throw new Error(`주소 변환 실패 : ${error.message}`);
    }
  }

  async getAddress(dto: ReverseGeocodingRequestDto): Promise<ReverseGeocodingResponseDto> {
    try {
      const response = await axios.get(this.NAVER_REVERSE_GEOCODING_URL, {
        params: {
          coords: `${dto.longitude},${dto.latitude}`,
          orders: 'legalcode,admcode,addr,roadaddr',
          output: 'json',
        },
        headers: {
          'X-NCP-APIGW-API-KEY-ID': this.NAVER_CLIENT_ID,
          'X-NCP-APIGW-API-KEY': this.NAVER_CLIENT_SECRET,
        },
      });

      const addr = response.data.results[2];
      const roadAddr = response.data.results[3];

      const pnu = addr.code.id + (addr.land.type === "" ? "0" : addr.land.type) + addr.land.number1.padStart(4, '0') + addr.land.number2.padStart(4, '0');
      const address = this.extractAddress(addr);
      const roadAddress = this.extractRoadAddress(roadAddr);

      return {
        pnu: pnu,
        address: address,
        roadAddress: roadAddress,
      };
    } catch (error) {
      this.logger.error(`요청 실패 : ${error.message}`);
      if (error.response) {
        this.logger.error(
          `실패 응답 데이터: ${JSON.stringify(error.response.data)}`,
        );
        this.logger.error(`실패 응답 상태: ${error.response.status}`);
      }
      throw new Error(`주소 변환 실패 : ${error.message}`);
    }
  }
}
