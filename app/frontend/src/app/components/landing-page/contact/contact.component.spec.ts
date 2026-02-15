import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { faker } from '@faker-js/faker';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { BrowserLocation } from '../../../services/browser-location.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;
  let fixture: ComponentFixture<ContactComponent>;
  const browserSpy = jasmine.createSpyObj('BrowserLocation', ['navigate']);

  beforeEach(async () => {
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', [
      'success',
      'info',
      'error',
    ]);
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
    const invalidEmail = faker.string.alpha({ length: 10 });
    const invalidMessage = faker.string.alpha({ length: 5 });

    component.contactForm.setValue({
      name: invalidName,
      email: invalidEmail,
      message: invalidMessage,
    });

    expect(component.contactForm.invalid).toBeTrue();
    expect(
      component.contactForm.controls.name.errors?.['minlength'],
    ).toBeTruthy();
    expect(component.contactForm.controls.email.errors?.['email']).toBeTruthy();
    expect(
      component.contactForm.controls.message.errors?.['minlength'],
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

    expect(toastrServiceSpy.info).toHaveBeenCalledWith(
      'CONTACT.TOAST.OPENING_MESSAGE',
      'CONTACT.TOAST.OPENING_TITLE',
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

    expect(toastrServiceSpy.info).not.toHaveBeenCalled();
    expect(browserSpy.navigate).not.toHaveBeenCalled();
  });

  it('should show success toast when copying email succeeds', async () => {
    spyOn(
      component as unknown as {
        copyToClipboard: (text: string) => Promise<boolean>;
      },
      'copyToClipboard',
    ).and.returnValue(Promise.resolve(true));

    await component.copyEmail();

    expect(toastrServiceSpy.success).toHaveBeenCalledWith(
      'CONTACT.TOAST.COPY_SUCCESS_MESSAGE',
      'CONTACT.TOAST.COPY_SUCCESS_TITLE',
    );
    expect(toastrServiceSpy.error).not.toHaveBeenCalled();
  });

  it('should show error toast when copying email fails', async () => {
    spyOn(
      component as unknown as {
        copyToClipboard: (text: string) => Promise<boolean>;
      },
      'copyToClipboard',
    ).and.returnValue(Promise.resolve(false));

    await component.copyEmail();

    expect(toastrServiceSpy.error).toHaveBeenCalledWith(
      'CONTACT.TOAST.COPY_ERROR_MESSAGE',
      'CONTACT.TOAST.COPY_ERROR_TITLE',
    );
  });
});
