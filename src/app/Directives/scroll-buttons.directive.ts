import { Directive, ElementRef, HostListener, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollButtons]',
  exportAs: 'appScrollButtons'
})
export class ScrollButtonsDirective implements OnInit {
  @Input() leftButton!: HTMLElement;
  @Input() rightButton!: HTMLElement;

  private scrollAmount = 300;

  private isDragging = false;
  private startX = 0;
  private scrollLeftStart = 0;

  constructor(private el: ElementRef<HTMLElement>) { }

  ngOnInit(): void {
    setTimeout(() => this.updateButtons(), 0);
  }

  scrollLeft(): void {
    this.el.nativeElement.scrollBy({ left: -this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateButtons(), 300);
  }

  scrollRight(): void {
    this.el.nativeElement.scrollBy({ left: this.scrollAmount, behavior: 'smooth' });
    setTimeout(() => this.updateButtons(), 300);
  }

  @HostListener('scroll')
  onScroll(): void {
    this.updateButtons();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateButtons();
  }
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const parentLi = target.closest('li');
    if (parentLi && this.el.nativeElement.contains(parentLi)) {
      parentLi.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.pageX - this.el.nativeElement.offsetLeft;
    this.scrollLeftStart = this.el.nativeElement.scrollLeft;
    this.el.nativeElement.style.cursor = 'grabbing';
    event.preventDefault();
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp(): void {
    this.isDragging = false;
    this.el.nativeElement.style.cursor = 'grab';
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    const x = event.pageX - this.el.nativeElement.offsetLeft;
    const walk = (x - this.startX) * 1; // 1 = scroll speed multiplier
    this.el.nativeElement.scrollLeft = this.scrollLeftStart - walk;
    this.updateButtons();
  }

  private updateButtons(): void {
    const container = this.el.nativeElement;
    const { scrollLeft, scrollWidth, clientWidth } = container;

    if (this.leftButton) {
      this.leftButton.style.display = scrollLeft > 10 ? 'block' : 'none';
    }
    if (this.rightButton) {
      this.rightButton.style.display =
        scrollLeft + clientWidth < scrollWidth - 10 ? 'block' : 'none';
    }
  }

  // Check if scroll is at the end
  isAtEnd(): boolean {
    const container = this.el.nativeElement;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    return scrollLeft + clientWidth >= scrollWidth - 10;
  }

  // Reset scroll to start
  resetToStart(): void {
    this.el.nativeElement.scrollTo({ left: 0, behavior: 'smooth' });
    setTimeout(() => this.updateButtons(), 300);
  }

  // Reset to start if at end
  resetToStartIfAtEnd(): void {
    if (this.isAtEnd()) {
      this.resetToStart();
    }
  }
}
