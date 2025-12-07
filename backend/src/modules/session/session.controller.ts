import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SessionService } from './session.service';
import { LeaderboardService } from './services/leaderboard.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/modules/auth/decorators/current-user.decorator';
import {
  CreateSessionDto,
  UpdateSessionDto,
  SessionResponseDto,
  SessionListDto,
  SessionFiltersDto,
  LeaderboardResponseDto,
} from './dto/session.dto';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new running session' })
  @ApiResponse({ status: 201, type: SessionResponseDto })
  async createSession(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionService.createSession(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List running sessions' })
  @ApiResponse({ status: 200, type: SessionListDto })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'privacy', required: false })
  @ApiQuery({ name: 'participating', required: false, type: Boolean })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listSessions(
    @CurrentUser('id') userId: string,
    @Query() filters: SessionFiltersDto,
  ): Promise<SessionListDto> {
    return this.sessionService.listSessions(userId, filters);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get current active session for user' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getActiveSession(
    @CurrentUser('id') userId: string,
  ): Promise<SessionResponseDto | null> {
    return this.sessionService.getActiveSessionForUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async getSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return this.sessionService.getSession(sessionId, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update session' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async updateSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
    @Body() dto: UpdateSessionDto,
  ): Promise<SessionResponseDto> {
    return this.sessionService.updateSession(sessionId, userId, dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start scheduled session' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async startSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return this.sessionService.startSession(sessionId, userId);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End active session' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async endSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return this.sessionService.endSession(sessionId, userId);
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a running session' })
  @ApiResponse({ status: 200, type: SessionResponseDto })
  async joinSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<SessionResponseDto> {
    return this.sessionService.joinSession(sessionId, userId);
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a running session' })
  async leaveSession(
    @CurrentUser('id') userId: string,
    @Param('id') sessionId: string,
  ): Promise<void> {
    await this.sessionService.leaveSession(sessionId, userId);
  }

  @Get(':id/leaderboard')
  @ApiOperation({ summary: 'Get session leaderboard' })
  @ApiResponse({ status: 200, type: LeaderboardResponseDto })
  async getLeaderboard(@Param('id') sessionId: string): Promise<LeaderboardResponseDto> {
    return this.leaderboardService.getSessionLeaderboard(sessionId);
  }
}

