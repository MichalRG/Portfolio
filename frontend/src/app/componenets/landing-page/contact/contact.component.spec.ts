import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BrowserLocation } from '../../../services/browser-location.service';
import { faker } from '@faker-js/faker';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let fixture: ComponentFixture<ContactComponent>;
  const browserSpy = jasmine.createSpyObj('BrowserLocation', ['navigate']);

  beforeEach(async () => {
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success']);
    await TestBed.configureTestingModule({
      imports: [
        ContactComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: ToastrService, useValue: toastrServiceSpy },
        { provide: BrowserLocation, useValue: browserSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.contactForm.value).toEqual({
      name: '',
      email: '',
      message: '',
    });
  });

  it('should mark form as invalid when empty', () => {
    component.contactForm.setValue({ name: '', email: '', message: '' });
    expect(component.contactForm.invalid).toBeTrue();
  });

  it('should require valid name, email, and message', () => {
    const invalidName = faker.string.alpha({ length: 1 });
    const invalidEmail = faker.internet.email().replace(/@.+/, '');
    const invalidMessage = faker.string.alpha({ length: 5 });

    component.contactForm.setValue({
      name: invalidName,
      email: invalidEmail,
      message: invalidMessage,
    });

    expect(component.contactForm.invalid).toBeTrue();
    expect(
      component.getFormControls['name'].errors?.['minlength'],
    ).toBeTruthy();
    expect(component.getFormControls['email'].errors?.['email']).toBeTruthy();
    expect(
      component.getFormControls['message'].errors?.['minlength'],
    ).toBeTruthy();
  });

  it('should submit form and call toastr/translate on valid input', () => {
    const name = faker.person.fullName();
    const email = faker.internet.email();
    const message = faker.lorem.sentence(10);

    component.contactForm.setValue({
      name,
      email,
      message,
    });

    component.onSubmit();

    expect(toastrServiceSpy.success).toHaveBeenCalledWith(
      'CONTACT.TOAST.MESSAGE',
      'CONTACT.TOAST.TITLE',
    );
    expect(component.contactForm.value).toEqual({
      name,
      email,
      message,
    });
    expect(browserSpy.navigate).toHaveBeenCalledWith(
      jasmine.stringMatching(/^mailto:/),
    );
  });

  it('should not submit if form is invalid', () => {
    component.contactForm.setValue({
      name: '',
      email: '',
      message: '',
    });

    component.onSubmit();

    expect(toastrServiceSpy.success).not.toHaveBeenCalled();
  });
});
