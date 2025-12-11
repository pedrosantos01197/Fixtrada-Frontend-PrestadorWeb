export function formatPhoneNumber(text: string): string {
  if (!text) return '';
  let userInput = text.replace(/\D/g, '');
  userInput = userInput.slice(0, 11);

  if (userInput.length > 7) {
    return `(${userInput.slice(0, 2)}) ${userInput.slice(2, 7)}-${userInput.slice(7, 11)}`;
  } else if (userInput.length > 2) {
    return `(${userInput.slice(0, 2)}) ${userInput.slice(2, 7)}`;
  } else if (userInput.length > 0) {
    return `(${userInput.slice(0, 2)}`;
  } else {
    return '';
  }
}

export function unformatPhoneNumber(text: string): string {
  if (!text) return '';
  return text.replace(/\D/g, '');
}

export function formatCEP(text: string): string {
  if (!text) return '';
  let userInput = text.replace(/\D/g, '');
  userInput = userInput.slice(0, 8);

  if (userInput.length > 5) {
    return `${userInput.slice(0, 5)}-${userInput.slice(5, 8)}`;
  } else {
    return userInput;
  }
}

export function unformatCEP(text: string): string {
  if (!text) return '';
  return text.replace(/\D/g, '');
}

export function formatCNPJ(text: string): string {
  if (!text) return '';
  let digits = text.replace(/\D/g, '').slice(0, 14);
  if (digits.length > 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  if (digits.length > 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}`;
  if (digits.length > 5) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}`;
  return digits;
}

export function unformatCNPJ(text: string): string {
  if (!text) return '';
  return text.replace(/\D/g, '').slice(0, 14);
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/D';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/D';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTime(timeString: string): string {
  if (!timeString) return 'N/D';
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(timeString)) {
    return timeString.substring(0, 5);
  }
  return timeString;
}
