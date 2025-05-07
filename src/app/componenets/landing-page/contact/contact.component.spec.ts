import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ContactComponent } from './contact.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let toastrServiceSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    toastrServiceSpy = jasmine.createSpyObj('ToastrService', ['success']);

    await TestBed.configureTestingModule({
      imports: [
        ContactComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
      ],
      providers: [{ provide: ToastrService, useValue: toastrServiceSpy }],
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
    component.contactForm.setValue({
      name: 'A',
      email: 'invalid-email',
      message: 'short',
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
    component.contactForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'This is a valid contact message.',
    });

    component.onSubmit();

    expect(toastrServiceSpy.success).toHaveBeenCalledWith(
      'CONTACT.TOAST.MESSAGE',
      'CONTACT.TOAST.TITLE',
    );
    expect(component.contactForm.value).toEqual({
      name: null,
      email: null,
      message: null,
    });
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
