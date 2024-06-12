import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Building } from './entities/building.entity';
import { Repository } from 'typeorm';
import { CreateWorkflowDto } from '@app/workflows';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
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
    console.log(
      JSON.stringify({ name: 'My Workflow', buildingId } as CreateWorkflowDto),
    );
    const response = await fetch('http://workflows-service:3001/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'My Workflow', buildingId }),
    });
    const newWorkflow = await response.json();
    console.log({ newWorkflow });
    return newWorkflow;
  }
}
