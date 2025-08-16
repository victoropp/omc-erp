import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query, 
  Headers, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StationsService } from './stations.service';

@ApiTags('stations')
@ApiBearerAuth()
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all stations' })
  @ApiResponse({ status: 200, description: 'List of stations' })
  async getStations(
    @Query() query: any,
    @Headers() headers: any,
  ) {
    return this.stationsService.getStations(query, headers);
  }

  @Get('management')
  @ApiOperation({ summary: 'Get station management data' })
  @ApiResponse({ status: 200, description: 'Station management data' })
  async getStationManagement(@Headers() headers: any) {
    return this.stationsService.getStationManagement(headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get station by ID' })
  @ApiResponse({ status: 200, description: 'Station details' })
  async getStation(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    return this.stationsService.getStation(id, headers);
  }

  @Post()
  @ApiOperation({ summary: 'Create new station' })
  @ApiResponse({ status: 201, description: 'Station created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createStation(
    @Body() stationData: any,
    @Headers() headers: any,
  ) {
    return this.stationsService.createStation(stationData, headers);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update station' })
  @ApiResponse({ status: 200, description: 'Station updated successfully' })
  async updateStation(
    @Param('id') id: string,
    @Body() updateData: any,
    @Headers() headers: any,
  ) {
    return this.stationsService.updateStation(id, updateData, headers);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete station' })
  @ApiResponse({ status: 200, description: 'Station deleted successfully' })
  async deleteStation(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    return this.stationsService.deleteStation(id, headers);
  }
}