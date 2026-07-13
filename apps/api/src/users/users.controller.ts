import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UsersService, DocumentType } from './users.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { STORAGE_PROVIDER, IStorageProvider } from '../storage/storage-provider.interface';

const VALID_DOC_TYPES: DocumentType[] = [
  'license',
  'licenseBack',
  'secondaryId',
  'businessPermit',
  'companyReg',
  'backgroundCheck',
  'avatar',
];
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'application/pdf'];

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(STORAGE_PROVIDER) private readonly storage: IStorageProvider,
  ) {}

  @Get('me')
  async getMe(@Req() req: { user: { id: string } }) {
    return { data: await this.usersService.getMe(req.user.id) };
  }

  @Patch('me')
  async updateMe(@Body() dto: UpdateMeDto, @Req() req: { user: { id: string } }) {
    return { data: await this.usersService.updateMe(req.user.id, dto) };
  }

  @Patch('me/password')
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: { user: { id: string } }) {
    return { data: await this.usersService.changePassword(req.user.id, dto) };
  }

  @Get('customers/:id')
  async getCustomerProfile(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    const profile = await this.usersService.getCustomerProfile(id, req.user.id);
    return { data: profile };
  }

  @Post('documents/:type')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPEG, PNG, and PDF files are accepted'), false);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { id: string } },
  ) {
    if (!VALID_DOC_TYPES.includes(type as DocumentType)) {
      throw new BadRequestException(`Invalid document type: ${type}`);
    }
    if (!file) throw new BadRequestException('No file provided');

    const fileUrl = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
    const result = await this.usersService.updateDocumentUrl(
      req.user.id,
      type as DocumentType,
      fileUrl,
    );
    return { data: result };
  }
}
