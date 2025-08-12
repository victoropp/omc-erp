import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { QueryStationsDto } from './dto/query-stations.dto';

@ApiTags('Stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Station code already exists' })
  async create(@Body() createStationDto: CreateStationDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    return this.stationsService.create(createStationDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stations with filters and pagination' })
  @ApiResponse({ status: 200, description: 'List of stations retrieved successfully' })
  async findAll(@Query() query: QueryStationsDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.findAll(query, tenantId);
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find stations near a location' })
  @ApiResponse({ status: 200, description: 'Nearby stations retrieved successfully' })
  async findNearby(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radius') radius: number = 50,
    @Request() req,
  ) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    
    if (!latitude || !longitude) {
      throw new BadRequestException('Latitude and longitude are required');
    }

    return this.stationsService.findNearbyStations(latitude, longitude, radius, tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Station found' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.findOne(id, tenantId);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get station statistics and status' })
  @ApiResponse({ status: 200, description: 'Station statistics retrieved successfully' })
  async getStatistics(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.getStationStatistics(id, tenantId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get station by code' })
  @ApiResponse({ status: 200, description: 'Station found' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  async findByCode(@Param('code') code: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.findByCode(code, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update station details' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiResponse({ status: 409, description: 'Station code already exists' })
  async update(@Param('id') id: string, @Body() updateStationDto: UpdateStationDto, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.update(id, updateStationDto, tenantId);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a station' })
  @ApiResponse({ status: 200, description: 'Station activated successfully' })
  async activate(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.activate(id, tenantId);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a station' })
  @ApiResponse({ status: 200, description: 'Station deactivated successfully' })
  async deactivate(@Param('id') id: string, @Body() body: { reason?: string }, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.deactivate(id, tenantId, body.reason);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a station' })
  @ApiResponse({ status: 204, description: 'Station deleted successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete station with active operations' })
  async remove(@Param('id') id: string, @Request() req) {
    const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
    return this.stationsService.remove(id, tenantId);
  }
}