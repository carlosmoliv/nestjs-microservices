import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildingDto } from '../../../../apps/virtual-facility/src/buildings/dto/create-building.dto';

export class UpdateWorkflowDto extends PartialType(CreateBuildingDto) {}
