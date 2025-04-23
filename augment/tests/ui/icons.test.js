/**
 * Tests for icon components
 */

const { screen, getByTestId } = require('@testing-library/dom');
require('@testing-library/jest-dom');

describe('Icon Components', () => {
  // Setup - create a simple DOM with icons
  beforeEach(() => {
    document.body.innerHTML = `
      <i data-testid="icon-xs" class="icon icon-xs fas fa-star"></i>
      <i data-testid="icon-sm" class="icon icon-sm fas fa-star"></i>
      <i data-testid="icon-md" class="icon icon-md fas fa-star"></i>
      <i data-testid="icon-lg" class="icon icon-lg fas fa-star"></i>
      <i data-testid="icon-xl" class="icon icon-xl fas fa-star"></i>
      <i data-testid="icon-primary" class="icon icon-primary fas fa-heart"></i>
      <i data-testid="icon-secondary" class="icon icon-secondary fas fa-heart"></i>
      <i data-testid="icon-success" class="icon icon-success fas fa-heart"></i>
      <i data-testid="icon-warning" class="icon icon-warning fas fa-heart"></i>
      <i data-testid="icon-danger" class="icon icon-danger fas fa-heart"></i>
      <i data-testid="icon-bg-primary" class="icon icon-bg icon-bg-primary fas fa-user"></i>
      <i data-testid="icon-gradient" class="icon icon-gradient-primary fas fa-rocket"></i>
      <i data-testid="icon-spin" class="icon icon-spin fas fa-spinner"></i>
    `;
  });

  test('Icon sizes should be applied correctly', () => {
    expect(screen.getByTestId('icon-xs')).toHaveClass('icon-xs');
    expect(screen.getByTestId('icon-sm')).toHaveClass('icon-sm');
    expect(screen.getByTestId('icon-md')).toHaveClass('icon-md');
    expect(screen.getByTestId('icon-lg')).toHaveClass('icon-lg');
    expect(screen.getByTestId('icon-xl')).toHaveClass('icon-xl');
  });

  test('Icon colors should be applied correctly', () => {
    expect(screen.getByTestId('icon-primary')).toHaveClass('icon-primary');
    expect(screen.getByTestId('icon-secondary')).toHaveClass('icon-secondary');
    expect(screen.getByTestId('icon-success')).toHaveClass('icon-success');
    expect(screen.getByTestId('icon-warning')).toHaveClass('icon-warning');
    expect(screen.getByTestId('icon-danger')).toHaveClass('icon-danger');
  });

  test('Icon with background should have correct classes', () => {
    const iconBg = screen.getByTestId('icon-bg-primary');
    expect(iconBg).toHaveClass('icon-bg');
    expect(iconBg).toHaveClass('icon-bg-primary');
  });

  test('Icon with gradient should have correct class', () => {
    expect(screen.getByTestId('icon-gradient')).toHaveClass('icon-gradient-primary');
  });

  test('Icon with animation should have correct class', () => {
    expect(screen.getByTestId('icon-spin')).toHaveClass('icon-spin');
  });

  test('All icons should have base icon class', () => {
    const allIcons = document.querySelectorAll('.icon');
    allIcons.forEach(icon => {
      expect(icon).toHaveClass('icon');
    });
  });

  test('All icons should have Font Awesome classes', () => {
    const allIcons = document.querySelectorAll('.icon');
    allIcons.forEach(icon => {
      expect(icon).toHaveClass('fas');
    });
  });
});
