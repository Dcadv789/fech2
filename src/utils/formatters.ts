export const formatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

export const formatPhoneNumber = (phone: string): string => {
  return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
};

export const calculateContractTime = (startDate: string): string => {
  const start = new Date(startDate);
  const today = new Date();
  const diffMonths = (today.getFullYear() - start.getFullYear()) * 12 + 
                    (today.getMonth() - start.getMonth());
  
  const formattedDate = start.toLocaleDateString('pt-BR');
  return `Cliente há ${diffMonths} meses (desde ${formattedDate})`;
};