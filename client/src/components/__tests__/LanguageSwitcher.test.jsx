import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageSwitcher } from '../LanguageSwitcher.jsx';
import { LanguageProvider } from '../../../context/languageContext';

// Mock axios
vi.mock('axios');
import axios from 'axios';

const MockedLanguageSwitcher = () => (
  <BrowserRouter>
    <LanguageProvider>
      <LanguageSwitcher />
    </LanguageProvider>
  </BrowserRouter>
);

describe('LanguageSwitcher Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock API responses
    axios.get.mockResolvedValue({
      data: {
        preferredLanguage: 'en',
        supportedLanguages: [
          { code: 'en', name: 'English', nativeName: 'English' },
          { code: 'es', name: 'Spanish', nativeName: 'Español' },
          { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' }
        ]
      }
    });
    
    axios.put.mockResolvedValue({
      data: { success: true, preferredLanguage: 'es' }
    });
  });

  it('should render language switcher button', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('should show dropdown when clicked', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    });
  });

  it('should change language when option selected', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption);
    });
    
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/languages/user'),
        expect.objectContaining({ preferredLanguage: 'es' }),
        expect.any(Object)
      );
    });
  });

  it('should display current language', async () => {
    localStorage.setItem('user', JSON.stringify({ preferredLanguage: 'es' }));
    
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      expect(screen.getByText(/español/i)).toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
    
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('English')).not.toBeInTheDocument();
    });
  });

  it('should show loading state while changing language', async () => {
    axios.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption);
    });
    
    // Should show some loading indicator
    await waitFor(() => {
      // Check for disabled state or spinner
      const buttons = screen.getAllByRole('button');
      expect(buttons.some(btn => btn.disabled)).toBe(true);
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.put.mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption);
    });
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    
    consoleSpy.mockRestore();
  });

  it('should persist selection to localStorage', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      const spanishOption = screen.getByText('Español');
      fireEvent.click(spanishOption);
    });
    
    await waitFor(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      expect(user.preferredLanguage).toBe('es');
    });
  });

  it('should be keyboard accessible', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
    });
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
    });
  });

  it('should display all supported languages', async () => {
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('हिन्दी')).toBeInTheDocument();
    });
  });

  it('should highlight current language in dropdown', async () => {
    localStorage.setItem('user', JSON.stringify({ preferredLanguage: 'es' }));
    
    render(<MockedLanguageSwitcher />);
    
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      const spanishOption = screen.getByText('Español').closest('button');
      expect(spanishOption).toHaveClass(/text-cyan-400|bg-slate-800/);
    });
  });
});
