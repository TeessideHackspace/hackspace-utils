import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { GlobalSettingsService } from './globalSettings.service';
import { GlobalSettings } from './globalSettings.model';
import { GlobalSettingsInput } from './setGlobalSettings.input';

@UseGuards(JwtAuthGuard, RolesGuard)
@Resolver()
export class GlobalSettingsResolver {
  constructor(private readonly settingsService: GlobalSettingsService) {}

  @Roles('admin')
  @Query((_returns) => GlobalSettings, { nullable: true })
  globalSettings() {
    return this.settingsService.getGlobalSettings();
  }

  @Roles('admin')
  @Mutation((_returns) => GlobalSettings)
  setGlobalSettings(
    @Args('input', { type: () => GlobalSettingsInput })
    connection: GlobalSettingsInput,
  ) {
    return this.settingsService.setGlobalSettings(connection);
  }
}
