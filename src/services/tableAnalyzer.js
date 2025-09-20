// services/tableAnalyzer.js
export const tableAnalyzer = {
  analyzeOrderError: (error) => {
    const requiredFields = [];
    
    if (error.message.includes('order_number')) {
      requiredFields.push('order_number');
    }
    if (error.message.includes('customer_name')) {
      requiredFields.push('customer_name');
    }
    if (error.message.includes('customer_email')) {
      requiredFields.push('customer_email');
    }
    if (error.message.includes('customer_phone')) {
      requiredFields.push('customer_phone');
    }
    if (error.message.includes('address')) {
      requiredFields.push('address');
    }
    
    return requiredFields;
  },

  generateFieldValue: (fieldName, userData) => {
    const generators = {
      order_number: () => 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      customer_name: () => userData?.name || userData?.first_name || 'Не указано',
      customer_email: () => userData?.email || 'no-email@example.com',
      customer_phone: () => userData?.phone || '+70000000000',
      address: () => 'Адрес не указан'
    };
    
    return generators[fieldName] ? generators[fieldName]() : 'Не указано';
  }
};