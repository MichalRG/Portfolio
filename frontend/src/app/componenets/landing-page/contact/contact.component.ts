import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

interface ContactForm {
  name: FormControl<string>;
  email: FormControl<string>;
  message: FormControl<string>;
}

@Component({
  selector: 'app-contact',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  contactForm: FormGroup;
  currentYear = new Date().getFullYear();
  isSubmitting = false;

  private translate = inject(TranslateService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);

  constructor() {
    this.contactForm = this.formBuilder.group<ContactForm>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      message: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(10)],
      }),
    });
  }

  get getFormControls() {
    return this.contactForm.controls;
  }

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;

    const name = this.contactForm.value.name;
    const email = this.contactForm.value.email;
    const message = this.contactForm.value.message;

    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(
      `Email: ${email}\n\n${message}\n\n${name}`,
    );
    const mailtoUrl = `mailto:you@example.com?subject=${subject}&body=${body}`;

    const titleToastr = this.translate.instant('CONTACT.TOAST.TITLE');
    const messageToastr = this.translate.instant('CONTACT.TOAST.MESSAGE');

    this.toastr.success(messageToastr, titleToastr);

    this.isSubmitting = false;
    window.location.href = mailtoUrl;
  }
}
