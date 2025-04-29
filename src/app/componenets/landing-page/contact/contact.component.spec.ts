import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ContactComponent } from './contact.component';

@Pipe({ name: 'translate', standalone: true })
class TranslateStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

fdescribe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);

    translateSpy.instant.and.callFake((key: string) => {
      switch (key) {
        case 'CONTACT.TOAST.TITLE':
          return 'Title';
        case 'CONTACT.TOAST.MESSAGE':
          return 'Message';
        default:
          return key;
      }
    });

    await TestBed.configureTestingModule({
      imports: [TranslateStubPipe, ReactiveFormsModule, ContactComponent],
      providers: [
        { provide: TranslateService, useValue: translateSpy },
        { provide: ToastrService, useValue: toastrSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and form controls', () => {
    expect(component).toBeTruthy();
    expect(component.contactForm.contains('name')).toBeTrue();
    expect(component.contactForm.contains('email')).toBeTrue();
    expect(component.contactForm.contains('message')).toBeTrue();
  });

  it('should not show toast when form is invalid', () => {
    component.contactForm.markAllAsTouched();
    component.onSubmit();
    expect(toastrSpy.success).not.toHaveBeenCalled();
  });

  it('should call toastr and reset form when valid', () => {
    component.contactForm.setValue({
      name: 'John',
      email: 'john@example.com',
      message: 'Hello world!',
    });
    component.onSubmit();
    expect(translateSpy.instant).toHaveBeenCalledWith('CONTACT.TOAST.TITLE');
    expect(translateSpy.instant).toHaveBeenCalledWith('CONTACT.TOAST.MESSAGE');
    expect(toastrSpy.success).toHaveBeenCalledWith('Message', 'Title');
    expect(component.contactForm.pristine).toBeTrue();
    expect(component.contactForm.value).toEqual({
      name: null,
      email: null,
      message: null,
    });
  });
});
