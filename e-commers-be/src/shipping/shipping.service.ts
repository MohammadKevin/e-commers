import { Injectable } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

export interface ShippingOption {
  courierName: string;
  courierService: string;
  serviceType: 'INSTANT' | 'EXPRESS' | 'REGULAR' | 'CARGO';
  description: string;
  cost: number;
  estimatedDays: string;
  badge?: string;
}

@Injectable()
export class ShippingService {
  async calculateShipping(dto: CalculateShippingDto): Promise<{ origin: string; destination: string; weightInKg: number; options: ShippingOption[] }> {
    const weightInKg = Math.ceil(dto.weightInGrams / 1000);
    const isSameCity = dto.originCity.toLowerCase().trim() === dto.destinationCity.toLowerCase().trim();
    const isNearby = !isSameCity; // simplified

    const options: ShippingOption[] = [];

    // === INSTANT (same city only) ===
    if (isSameCity) {
      options.push({
        courierName: 'GoSend',
        courierService: 'INSTANT',
        serviceType: 'INSTANT',
        description: 'Pengiriman Instan — Sampai dalam 2-3 jam',
        cost: 25000,
        estimatedDays: '2-3 jam',
        badge: '⚡ Tercepat',
      });
      options.push({
        courierName: 'GrabExpress',
        courierService: 'SAME_DAY',
        serviceType: 'INSTANT',
        description: 'Same Day — Sampai hari ini',
        cost: 20000,
        estimatedDays: '4-6 jam',
        badge: '🔥 Same Day',
      });
    }

    // === EXPRESS (kilat) ===
    options.push({
      courierName: 'JNE',
      courierService: 'YES',
      serviceType: 'EXPRESS',
      description: 'JNE Yakin Esok Sampai — Terjamin 1 hari',
      cost: isSameCity ? 23000 * weightInKg : 35000 * weightInKg,
      estimatedDays: isSameCity ? '1 hari' : '1-2 hari',
      badge: '🚀 Kilat',
    });
    options.push({
      courierName: 'SiCepat',
      courierService: 'HALU',
      serviceType: 'EXPRESS',
      description: 'SiCepat HALU — Layanan ekspres prioritas',
      cost: isSameCity ? 20000 * weightInKg : 28000 * weightInKg,
      estimatedDays: isSameCity ? '1 hari' : '1-2 hari',
      badge: '🚀 Kilat',
    });

    // === REGULAR ===
    options.push({
      courierName: 'JNE',
      courierService: 'REG',
      serviceType: 'REGULAR',
      description: 'JNE Reguler — Pengiriman standar terpercaya',
      cost: isSameCity ? 9000 * weightInKg : 15000 * weightInKg,
      estimatedDays: isSameCity ? '1-2 hari' : '2-3 hari',
    });
    options.push({
      courierName: 'SiCepat',
      courierService: 'REG',
      serviceType: 'REGULAR',
      description: 'SiCepat Reguler — Cepat dan terjangkau',
      cost: isSameCity ? 8000 * weightInKg : 14000 * weightInKg,
      estimatedDays: isSameCity ? '1-2 hari' : '2-3 hari',
    });
    options.push({
      courierName: 'J&T Express',
      courierService: 'EZ',
      serviceType: 'REGULAR',
      description: 'J&T EZ — Jaringan luas seluruh Indonesia',
      cost: isSameCity ? 10000 * weightInKg : 16000 * weightInKg,
      estimatedDays: isSameCity ? '1-2 hari' : '2-4 hari',
    });
    options.push({
      courierName: 'POS Indonesia',
      courierService: 'PAKET_KILAT',
      serviceType: 'REGULAR',
      description: 'Pos Paket Kilat — Pengiriman ke seluruh nusantara',
      cost: isSameCity ? 7000 * weightInKg : 12000 * weightInKg,
      estimatedDays: isSameCity ? '2-3 hari' : '3-5 hari',
    });

    // === CARGO (berat) ===
    if (weightInKg >= 3) {
      options.push({
        courierName: 'JNE',
        courierService: 'OKE',
        serviceType: 'CARGO',
        description: 'JNE OKE Cargo — Hemat untuk barang berat',
        cost: isSameCity ? 5000 * weightInKg : 8000 * weightInKg,
        estimatedDays: isSameCity ? '3-5 hari' : '5-7 hari',
        badge: '📦 Cargo',
      });
      options.push({
        courierName: 'Wahana',
        courierService: 'CARGO',
        serviceType: 'CARGO',
        description: 'Wahana Cargo — Solusi pengiriman barang besar',
        cost: isSameCity ? 4500 * weightInKg : 7500 * weightInKg,
        estimatedDays: isSameCity ? '3-5 hari' : '5-8 hari',
        badge: '📦 Cargo',
      });
    } else {
      // always show cargo option even for light items
      options.push({
        courierName: 'JNE',
        courierService: 'OKE',
        serviceType: 'CARGO',
        description: 'JNE OKE — Hemat, cocok untuk barang kecil',
        cost: isSameCity ? 5000 * weightInKg : 8000 * weightInKg,
        estimatedDays: isSameCity ? '3-5 hari' : '5-7 hari',
        badge: '📦 Hemat',
      });
    }

    return {
      origin: dto.originCity,
      destination: dto.destinationCity,
      weightInKg,
      options,
    };
  }
}
