import { 
  Controller, 
  Get, 
  Post, 
  Put, 
 
  Param, 
  Body, 
  Query, 
  Headers, 
  HttpStatus, 
  HttpCode 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get inventory items' })
  @ApiResponse({ status: 200, description: 'List of inventory items' })
  async getInventory(
    @Query() query: any,
    @Headers() headers: any,
  ) {
    return this.inventoryService.getInventory(query, headers);
  }

  @Get('tank-levels')
  @ApiOperation({ summary: 'Get tank levels' })
  @ApiResponse({ status: 200, description: 'Tank level data' })
  async getTankLevels(@Headers() headers: any) {
    return this.inventoryService.getTankLevels(headers);
  }

  @Post('update')
  @ApiOperation({ summary: 'Update inventory' })
  @ApiResponse({ status: 200, description: 'Inventory updated successfully' })
  async updateInventory(
    @Body() updateData: any,
    @Headers() headers: any,
  ) {
    return this.inventoryService.updateInventory(updateData, headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({ status: 200, description: 'Inventory item details' })
  async getInventoryItem(
    @Param('id') id: string,
    @Headers() headers: any,
  ) {
    return this.inventoryService.getInventoryItem(id, headers);
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createInventoryItem(
    @Body() itemData: any,
    @Headers() headers: any,
  ) {
    return this.inventoryService.createInventoryItem(itemData, headers);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({ status: 200, description: 'Inventory item updated successfully' })
  async updateInventoryItem(
    @Param('id') id: string,
    @Body() updateData: any,
    @Headers() headers: any,
  ) {
    return this.inventoryService.updateInventoryItem(id, updateData, headers);
  }
}