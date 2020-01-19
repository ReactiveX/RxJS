import {CommonModule} from '@angular/common';
import {NgModule, Type} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule
} from '@angular/material';
import {CodeExampleModule} from '../code/code-example.module';
import {WithCustomElementComponent} from '../element-registry';
import {FilterFormComponent} from './components/filter-form.component';
import {BreakingChangeDescriptionTableComponent} from './components/migration-timeline/breaking-change-description-table.component';
import {DeprecationDescriptionTableComponent} from './components/migration-timeline/deprecation-description-table.component';
import {MigrationTimelineComponent} from './components/migration-timeline/migration-timeline.component';
import {ReleaseNavigationComponent} from './components/release-navigation.component';
import {MigrationTimelineService} from './data-access/migration-timeline.service';
import {MigrationTimelineContainerComponent} from './migration-timeline.container.component';
import { MissingInformationComponent } from './components/migration-timeline/missing-information/missing-information.component';
import { CopyToClipboardDirective } from './components/copy-to-clipboard.directive';
import { DeprecationItemFormComponent } from './components/migration-timeline/missing-information/deprecation-item-form.component';

export const baseURL = 'migration-timeline';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    CodeExampleModule,
    MatChipsModule, MatCardModule, MatExpansionModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatInputModule
  ],
  declarations: [
    MigrationTimelineContainerComponent,
    MigrationTimelineComponent, DeprecationDescriptionTableComponent,
    BreakingChangeDescriptionTableComponent, MissingInformationComponent, DeprecationItemFormComponent,
    CopyToClipboardDirective, FilterFormComponent,
    ReleaseNavigationComponent
   ],
  entryComponents: [MigrationTimelineContainerComponent],
  providers: [MigrationTimelineService]
})
export class MigrationTimelineModule implements WithCustomElementComponent {
  customElementComponent: Type<any> = MigrationTimelineContainerComponent;
}
