import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';
import { ProjectsComponent } from './projects.component';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProjectsComponent,
        TranslateModule.forRoot(),
        ScrollRevealDirective,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should contain 4 project entries', () => {
    expect(component.projects.length).toBe(4);
  });

  it('should contain correct keys in first project', () => {
    const project = component.projects[0];
    expect(project).toEqual(
      jasmine.objectContaining({
        title: 'PROJECTS.UNIVERSITY.NAME',
        icon: 'university.svg',
        description: 'PROJECTS.UNIVERSITY.DESCRIPTION',
        linkDescription: 'PROJECTS.UNIVERSITY.LINK',
        link: 'https://ubb.edu.pl/en/',
      }),
    );
  });
});
