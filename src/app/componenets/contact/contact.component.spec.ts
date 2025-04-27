import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ContactComponent } from './contact.component';

// Stub translate pipe for tests
@Pipe({ name: 'translate' })
class TranslateStubPipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;
  let translateSpy: jasmine.SpyObj<TranslateService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success']);

    translateSpy.instant.and.callFake((key: string) => {
      if (key === 'CONTACT.TOAST.TITLE') return 'Title';
      if (key === 'CONTACT.TOAST.MESSAGE') return 'Message';
      return key;
    });

    await TestBed.configureTestingModule({
      declarations: [TranslateStubPipe],
      imports: [ReactiveFormsModule, ContactComponent],
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

  it('should not call toastr when form is invalid', () => {
    component.onSubmit();
    expect(toastrSpy.success).not.toHaveBeenCalled();
  });

  it('should call toastr and reset the form when valid', () => {
    // Arrange: set valid values
    component.contactForm.setValue({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello there!',
    });

    // Act
    component.onSubmit();

    // Assert toastr called with translated strings
    expect(translateSpy.instant).toHaveBeenCalledWith('CONTACT.TOAST.TITLE');
    expect(translateSpy.instant).toHaveBeenCalledWith('CONTACT.TOAST.MESSAGE');
    expect(toastrSpy.success).toHaveBeenCalledWith('Message', 'Title');

    // Assert form reset (pristine state)
    expect(component.contactForm.pristine).toBeTrue();
    expect(component.contactForm.value).toEqual({
      name: null,
      email: null,
      message: null,
    });
  });
});
