import {
  Controller,
  Get,
  Post,
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
import { STORAGE_PROVIDER, IStorageProvider } from '../storage/storage-provider.interface';

const VALID_DOC_TYPES: DocumentType[] = ['license', 'secondaryId', 'businessPermit', 'companyReg'];
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
  async getMe(@Req() req: { user: { userId: string } }) {
    return { data: await this.usersService.getMe(req.user.userId) };
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
    @Req() req: { user: { userId: string } },
  ) {
    if (!VALID_DOC_TYPES.includes(type as DocumentType)) {
      throw new BadRequestException(`Invalid document type: ${type}`);
    }
    if (!file) throw new BadRequestException('No file provided');

    const fileUrl = await this.storage.upload(file.buffer, file.originalname, file.mimetype);
    const result = await this.usersService.updateDocumentUrl(
      req.user.userId,
      type as DocumentType,
      fileUrl,
    );
    return { data: result };
  }
}
