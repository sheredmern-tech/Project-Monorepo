// ===== FILE: src/modules/dokumen/dto/query-workflow.dto.ts =====
import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkflowStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryWorkflowDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: WorkflowStatus,
    description: 'Filter by workflow status',
    example: WorkflowStatus.SUBMITTED
  })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;

  @ApiPropertyOptional({
    description: 'Filter by perkara ID',
    example: 'uuid-perkara'
  })
  @IsOptional()
  @IsUUID()
  perkara_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by submitted user ID',
    example: 'uuid-user'
  })
  @IsOptional()
  @IsUUID()
  submitted_by?: string;

  @ApiPropertyOptional({
    description: 'Filter by reviewer user ID',
    example: 'uuid-user'
  })
  @IsOptional()
  @IsUUID()
  reviewed_by?: string;

  @ApiPropertyOptional({
    description: 'Filter documents submitted after this date',
    example: '2024-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  submitted_after?: string;

  @ApiPropertyOptional({
    description: 'Filter documents submitted before this date',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  submitted_before?: string;
}
