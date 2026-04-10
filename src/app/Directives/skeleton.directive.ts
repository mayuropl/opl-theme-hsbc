import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appSkeleton]'
})
export class SkeletonDirective implements OnChanges {
  @Input() appSkeleton = false;
  private originalContent: string | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    const element = this.el.nativeElement;

    if (changes['appSkeleton']) {
      if (this.appSkeleton) {
        // Save the current innerHTML (which may have been updated by Angular)
        if (this.originalContent === null || !element.innerHTML.includes('skeleton_wrap')) {
          this.originalContent = element.innerHTML;
        }

        // Add skeleton class
        this.renderer.addClass(element, 'skeleton');

        // Replace with skeleton markup
        this.renderer.setProperty(element, 'innerHTML', '<div class="skeleton_wrap"></div>');
      } else {
        // Remove skeleton class
        this.renderer.removeClass(element, 'skeleton');

        // Restore the original content which contains Angular bindings
        // This allows Angular to update the interpolated values
        if (this.originalContent !== null) {
          this.renderer.setProperty(element, 'innerHTML', this.originalContent);
          // After restoring, let Angular update with latest data
          // The originalContent has the template bindings, Angular will update the values
        }
      }
    }
  }
}
