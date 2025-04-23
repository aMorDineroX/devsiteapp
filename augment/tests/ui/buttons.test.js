/**
 * Tests for button components
 */

const { screen, getByText, fireEvent } = require('@testing-library/dom');
require('@testing-library/jest-dom');

describe('Button Components', () => {
  // Setup - create a simple DOM with buttons
  beforeEach(() => {
    document.body.innerHTML = `
      <button class="btn btn-primary">Primary Button</button>
      <button class="btn btn-secondary">Secondary Button</button>
      <button class="btn btn-success">Success Button</button>
      <button class="btn btn-warning">Warning Button</button>
      <button class="btn btn-danger">Danger Button</button>
      <button class="btn btn-outline-primary">Outline Primary</button>
      <button class="btn btn-hover-lift">Hover Lift Button</button>
    `;
  });

  test('Primary button should be in the document', () => {
    const primaryButton = screen.getByText('Primary Button');
    expect(primaryButton).toBeInTheDocument();
    expect(primaryButton).toHaveClass('btn');
    expect(primaryButton).toHaveClass('btn-primary');
  });

  test('Secondary button should be in the document', () => {
    const secondaryButton = screen.getByText('Secondary Button');
    expect(secondaryButton).toBeInTheDocument();
    expect(secondaryButton).toHaveClass('btn');
    expect(secondaryButton).toHaveClass('btn-secondary');
  });

  test('Success button should be in the document', () => {
    const successButton = screen.getByText('Success Button');
    expect(successButton).toBeInTheDocument();
    expect(successButton).toHaveClass('btn');
    expect(successButton).toHaveClass('btn-success');
  });

  test('Warning button should be in the document', () => {
    const warningButton = screen.getByText('Warning Button');
    expect(warningButton).toBeInTheDocument();
    expect(warningButton).toHaveClass('btn');
    expect(warningButton).toHaveClass('btn-warning');
  });

  test('Danger button should be in the document', () => {
    const dangerButton = screen.getByText('Danger Button');
    expect(dangerButton).toBeInTheDocument();
    expect(dangerButton).toHaveClass('btn');
    expect(dangerButton).toHaveClass('btn-danger');
  });

  test('Outline button should be in the document', () => {
    const outlineButton = screen.getByText('Outline Primary');
    expect(outlineButton).toBeInTheDocument();
    expect(outlineButton).toHaveClass('btn');
    expect(outlineButton).toHaveClass('btn-outline-primary');
  });

  test('Hover lift button should be in the document', () => {
    const hoverLiftButton = screen.getByText('Hover Lift Button');
    expect(hoverLiftButton).toBeInTheDocument();
    expect(hoverLiftButton).toHaveClass('btn');
    expect(hoverLiftButton).toHaveClass('btn-hover-lift');
  });

  test('Button should be clickable', () => {
    const primaryButton = screen.getByText('Primary Button');
    const mockClickHandler = jest.fn();
    
    primaryButton.addEventListener('click', mockClickHandler);
    fireEvent.click(primaryButton);
    
    expect(mockClickHandler).toHaveBeenCalledTimes(1);
  });
});
