import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';
import { WORKFLOWS_SERVICE } from '../constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @Inject(WORKFLOWS_SERVICE)
    private readonly workflowsService: ClientProxy,
  ) {}

  async create(createBuildingDto: CreateBuildingDto): Promise<Building> {
    const building = this.buildingRepository.create({ ...createBuildingDto });
    const newBuildingEntity = await this.buildingRepository.save(building);
    await this.createWorkflow(newBuildingEntity.id);
    return newBuildingEntity;
  }

  async findAll(): Promise<Building[]> {
    return this.buildingRepository.find();
  }

  async findOne(id: number): Promise<Building> {
    const building = await this.buildingRepository.findOne({ where: { id } });
    if (!building)
      throw new NotFoundException(`Building with id #${id} does not exist`);
    return building;
  }

  async update(
    id: number,
    updateBuildingDto: UpdateBuildingDto,
  ): Promise<Building> {
    const building = await this.buildingRepository.preload({
      id: +id,
      ...updateBuildingDto,
    });
    if (!building) {
      throw new NotFoundException(`Building with id #${id} does not exist`);
    }
    return this.buildingRepository.save(building);
  }

  async remove(id: number) {
    const building = await this.findOne(id);
    return this.buildingRepository.remove(building);
  }

  async createWorkflow(buildingId: number) {
    const newWorkflow = await lastValueFrom(
      this.workflowsService.send('workflows.create', {
        name: 'My Workflow',
        buildingId,
      } as CreateWorkflowDto),
    );
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
