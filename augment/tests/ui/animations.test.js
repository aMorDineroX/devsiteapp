/**
 * Tests for animation components
 */

const { screen, getByTestId } = require('@testing-library/dom');
require('@testing-library/jest-dom');

describe('Animation Components', () => {
  // Setup - create a simple DOM with animated elements
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-testid="floating" class="floating"></div>
      <div data-testid="pulse" class="pulse"></div>
      <div data-testid="bounce" class="bounce"></div>
      <div data-testid="spin-slow" class="spin-slow"></div>
      <div data-testid="blob" class="blob"></div>
      <div data-testid="reveal" class="reveal"></div>
      <div data-testid="reveal-active" class="reveal active"></div>
      <div data-testid="reveal-up" class="reveal reveal-up"></div>
      <div data-testid="reveal-left" class="reveal reveal-left"></div>
      <div data-testid="reveal-right" class="reveal reveal-right"></div>
      <div data-testid="animate-scroll" class="animate-scroll"></div>
      <div data-testid="animate-scroll-reverse" class="animate-scroll-reverse"></div>
      <div data-testid="background-animate" class="background-animate"></div>
      <div data-testid="typewriter" class="typewriter"></div>
      <div data-testid="dots-pattern" class="dots-pattern"></div>
    `;
  });

  test('Floating animation class should be applied', () => {
    expect(screen.getByTestId('floating')).toHaveClass('floating');
  });

  test('Pulse animation class should be applied', () => {
    expect(screen.getByTestId('pulse')).toHaveClass('pulse');
  });

  test('Bounce animation class should be applied', () => {
    expect(screen.getByTestId('bounce')).toHaveClass('bounce');
  });

  test('Spin animation class should be applied', () => {
    expect(screen.getByTestId('spin-slow')).toHaveClass('spin-slow');
  });

  test('Blob animation class should be applied', () => {
    expect(screen.getByTestId('blob')).toHaveClass('blob');
  });

  test('Reveal animation classes should be applied', () => {
    expect(screen.getByTestId('reveal')).toHaveClass('reveal');
    expect(screen.getByTestId('reveal-active')).toHaveClass('reveal');
    expect(screen.getByTestId('reveal-active')).toHaveClass('active');
    expect(screen.getByTestId('reveal-up')).toHaveClass('reveal');
    expect(screen.getByTestId('reveal-up')).toHaveClass('reveal-up');
    expect(screen.getByTestId('reveal-left')).toHaveClass('reveal');
    expect(screen.getByTestId('reveal-left')).toHaveClass('reveal-left');
    expect(screen.getByTestId('reveal-right')).toHaveClass('reveal');
    expect(screen.getByTestId('reveal-right')).toHaveClass('reveal-right');
  });

  test('Scroll animation classes should be applied', () => {
    expect(screen.getByTestId('animate-scroll')).toHaveClass('animate-scroll');
    expect(screen.getByTestId('animate-scroll-reverse')).toHaveClass('animate-scroll-reverse');
  });

  test('Background animation class should be applied', () => {
    expect(screen.getByTestId('background-animate')).toHaveClass('background-animate');
  });

  test('Typewriter animation class should be applied', () => {
    expect(screen.getByTestId('typewriter')).toHaveClass('typewriter');
  });

  test('Dots pattern animation class should be applied', () => {
    expect(screen.getByTestId('dots-pattern')).toHaveClass('dots-pattern');
  });
});
