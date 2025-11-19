import { Controller, Get, Query, Param, Delete, Post, Body } from '@nestjs/common';
import { ExternalDataService } from './external-data.service';

@Controller('external-data')
export class ExternalDataController {
  constructor(private readonly externalDataService: ExternalDataService) { }

  // ========== UU (UNDANG-UNDANG) ==========
  @Get('uu')
  async getUU(@Query('no-cache') noCache?: string) {
    const useCache = noCache !== 'true';
    return this.externalDataService.getUU(useCache);
  }

  // ========== PERATURAN ==========
  @Get('peraturan')
  async getPeraturan(@Query('no-cache') noCache?: string) {
    const useCache = noCache !== 'true';
    return this.externalDataService.getPeraturan(useCache);
  }

  // ========== ARTIKEL HUKUM ==========
  @Get('artikel-hukum')
  async getArtikelHukum(@Query('no-cache') noCache?: string) {
    const useCache = noCache !== 'true';
    return this.externalDataService.getArtikelHukum(useCache);
  }

  // ========== CUSTOM FETCH ==========
  @Get('custom')
  async fetchCustom(
    @Query('url') url: string,
    @Query('no-cache') noCache?: string,
  ) {
    if (!url) {
      return {
        error: 'URL parameter is required',
        example: '/external-data/custom?url=https://api.npoint.io/your-bin-id',
      };
    }

    const useCache = noCache !== 'true';
    return this.externalDataService.fetchCustom(url, useCache);
  }

  // ========== CACHE MANAGEMENT ==========
  @Delete('cache')
  clearAllCache() {
    this.externalDataService.clearCache();
    return {
      success: true,
      message: 'All cache cleared',
    };
  }

  @Delete('cache/:key')
  clearSpecificCache(@Param('key') key: string) {
    this.externalDataService.clearCache(key);
    return {
      success: true,
      message: `Cache cleared for key: ${key}`,
    };
  }

  // ========== ENDPOINT MANAGEMENT ==========
  @Get('endpoints')
  getEndpoints() {
    return {
      success: true,
      endpoints: this.externalDataService.getEndpoints(),
    };
  }

  @Post('endpoints')
  addEndpoint(@Body() body: { key: string; path: string }) {
    const { key, path } = body;

    if (!key || !path) {
      return {
        success: false,
        message: 'Both key and path are required',
      };
    }

    this.externalDataService.addEndpoint(key, path);

    return {
      success: true,
      message: `Endpoint added: ${key} -> ${path}`,
    };
  }

  // ========== HEALTH CHECK ==========
  @Get('health')
  async healthCheck() {
    const isHealthy = await this.externalDataService.healthCheck();

    return {
      success: isHealthy,
      service: 'External Data (Npoint.io)',
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
    };
  }
}