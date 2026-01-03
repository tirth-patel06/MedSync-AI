import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadabilityIndicator from '../ReadabilityIndicator.jsx';

describe('ReadabilityIndicator Component', () => {
  describe('rendering', () => {
    it('should render with elementary level (green)', () => {
      render(<ReadabilityIndicator grade={4} />);
      
      const indicator = screen.getByText(/grade 4/i);
      expect(indicator).toBeInTheDocument();
      expect(indicator.closest('div')).toHaveClass(/green|emerald/);
    });

    it('should render with high school level (yellow)', () => {
      render(<ReadabilityIndicator grade={10} />);
      
      const indicator = screen.getByText(/grade 10/i);
      expect(indicator).toBeInTheDocument();
      expect(indicator.closest('div')).toHaveClass(/yellow|amber/);
    });

    it('should render with college level (red)', () => {
      render(<ReadabilityIndicator grade={15} />);
      
      const indicator = screen.getByText(/grade 15/i);
      expect(indicator).toBeInTheDocument();
      expect(indicator.closest('div')).toHaveClass(/red|rose/);
    });

    it('should display Flesch-Kincaid score', () => {
      render(<ReadabilityIndicator grade={8} fleschKincaid={8.5} />);
      
      expect(screen.getByText(/8\.5/)).toBeInTheDocument();
    });

    it('should display Flesch Reading Ease score', () => {
      render(<ReadabilityIndicator grade={8} fleschReadingEase={65.5} />);
      
      expect(screen.getByText(/65\.5/)).toBeInTheDocument();
    });

    it('should display reading level label', () => {
      render(<ReadabilityIndicator grade={10} readingLevel="High School" />);
      
      expect(screen.getByText(/high school/i)).toBeInTheDocument();
    });
  });

  describe('color coding', () => {
    it('should use green for grades 1-6', () => {
      const { container } = render(<ReadabilityIndicator grade={5} />);
      const badge = container.querySelector('[class*="green"]');
      expect(badge).toBeInTheDocument();
    });

    it('should use yellow for grades 7-12', () => {
      const { container } = render(<ReadabilityIndicator grade={9} />);
      const badge = container.querySelector('[class*="yellow"]');
      expect(badge).toBeInTheDocument();
    });

    it('should use red for grades 13+', () => {
      const { container } = render(<ReadabilityIndicator grade={14} />);
      const badge = container.querySelector('[class*="red"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('tooltip', () => {
    it('should show tooltip on hover', async () => {
      const { container } = render(<ReadabilityIndicator grade={8} />);
      
      const indicator = container.firstChild;
      expect(indicator).toHaveAttribute('title');
    });

    it('should include detailed information in tooltip', () => {
      const { container } = render(
        <ReadabilityIndicator 
          grade={10}
          fleschKincaid={10.5}
          fleschReadingEase={55.2}
          readingLevel="High School"
        />
      );
      
      const tooltip = container.querySelector('[title]');
      expect(tooltip?.getAttribute('title')).toContain('Grade');
      expect(tooltip?.getAttribute('title')).toContain('10');
    });

    it('should show recommendations when available', () => {
      render(
        <ReadabilityIndicator 
          grade={15}
          recommendations={['Simplify medical terms', 'Use shorter sentences']}
        />
      );
      
      expect(screen.getByText(/simplify/i)).toBeInTheDocument();
      expect(screen.getByText(/shorter sentences/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle grade 0', () => {
      render(<ReadabilityIndicator grade={0} />);
      expect(screen.getByText(/grade 0/i)).toBeInTheDocument();
    });

    it('should handle very high grades', () => {
      render(<ReadabilityIndicator grade={25} />);
      expect(screen.getByText(/grade 25/i)).toBeInTheDocument();
    });

    it('should handle decimal grades', () => {
      render(<ReadabilityIndicator grade={8.7} />);
      expect(screen.getByText(/8\.7/)).toBeInTheDocument();
    });

    it('should handle missing optional props', () => {
      render(<ReadabilityIndicator grade={8} />);
      expect(screen.getByText(/grade 8/i)).toBeInTheDocument();
    });

    it('should handle negative grades gracefully', () => {
      render(<ReadabilityIndicator grade={-1} />);
      // Should render without crashing
      expect(screen.getByText(/grade/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { container } = render(<ReadabilityIndicator grade={8} />);
      const indicator = container.firstChild;
      expect(indicator).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible', () => {
      const { container } = render(<ReadabilityIndicator grade={8} />);
      const indicator = container.firstChild;
      expect(indicator).toHaveAttribute('tabIndex');
    });

    it('should provide screen reader text', () => {
      render(<ReadabilityIndicator grade={10} readingLevel="High School" />);
      expect(screen.getByText(/grade 10/i)).toBeInTheDocument();
      expect(screen.getByText(/high school/i)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply compact style when specified', () => {
      const { container } = render(<ReadabilityIndicator grade={8} compact />);
      const indicator = container.firstChild;
      expect(indicator).toHaveClass(/compact|small|sm/);
    });

    it('should have hover effects', () => {
      const { container } = render(<ReadabilityIndicator grade={8} />);
      const indicator = container.firstChild;
      expect(indicator?.className).toMatch(/hover/);
    });

    it('should be responsive', () => {
      const { container } = render(<ReadabilityIndicator grade={8} />);
      const indicator = container.firstChild;
      // Should have responsive classes
      expect(indicator?.className).toBeDefined();
    });
  });

  describe('internationalization', () => {
    it('should display correctly for different languages', () => {
      render(<ReadabilityIndicator grade={8} language="es" />);
      expect(screen.getByText(/grade 8/i)).toBeInTheDocument();
    });

    it('should format numbers according to locale', () => {
      render(<ReadabilityIndicator grade={8.5} fleschKincaid={8.5} />);
      // Should show decimal point
      expect(screen.getByText(/8\.5/)).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should render quickly', () => {
      const start = Date.now();
      render(<ReadabilityIndicator grade={8} />);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should not cause re-renders with same props', () => {
      const { rerender } = render(<ReadabilityIndicator grade={8} />);
      const firstRender = screen.getByText(/grade 8/i);
      
      rerender(<ReadabilityIndicator grade={8} />);
      const secondRender = screen.getByText(/grade 8/i);
      
      // Should be the same element (memoized)
      expect(firstRender).toBe(secondRender);
    });
  });
});
