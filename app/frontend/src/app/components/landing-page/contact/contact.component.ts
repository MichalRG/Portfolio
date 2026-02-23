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
import { BrowserLocation } from '../../../services/browser-location.service';

interface ContactForm {
  name: FormControl<string>;
  email: FormControl<string>;
  message: FormControl<string>;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  contactForm: FormGroup<ContactForm>;
  readonly currentYear = new Date().getFullYear();
  readonly contactEmail = 'michal.krzyzowski98@gmail.com';
  isSubmitting = false;

  private translate = inject(TranslateService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private browser = inject(BrowserLocation);

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

  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const { name, email, message } = this.contactForm.getRawValue();

    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`Email: ${email}\n\n${message}\n\n${name}`);
    const mailtoUrl = `mailto:${this.contactEmail}?subject=${subject}&body=${body}`;

    const titleToastr = this.translate.instant('CONTACT.TOAST.OPENING_TITLE');
    const messageToastr = this.translate.instant(
      'CONTACT.TOAST.OPENING_MESSAGE',
    );

    this.toastr.info(messageToastr, titleToastr);

    this.isSubmitting = false;
    this.browser.navigate(mailtoUrl);
  }

  async copyEmail() {
    const isCopied = await this.copyToClipboard(this.contactEmail);

    if (isCopied) {
      this.toastr.success(
        this.translate.instant('CONTACT.TOAST.COPY_SUCCESS_MESSAGE'),
        this.translate.instant('CONTACT.TOAST.COPY_SUCCESS_TITLE'),
      );
      return;
    }

    this.toastr.error(
      this.translate.instant('CONTACT.TOAST.COPY_ERROR_MESSAGE'),
      this.translate.instant('CONTACT.TOAST.COPY_ERROR_TITLE'),
    );
  }

  private async copyToClipboard(text: string): Promise<boolean> {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !window.isSecureContext ||
      !navigator.clipboard?.writeText
    ) {
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
