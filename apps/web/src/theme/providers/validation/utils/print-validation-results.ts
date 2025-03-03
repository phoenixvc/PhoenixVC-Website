import { ValidationResult } from "@/theme/types";

export const printValidationResults = (results: ValidationResult | ValidationResult[], context?: string): void => {
  const resultArray = Array.isArray(results) ? results : [results];

  console.group(context ? `Validation Results: ${context}` : "Validation Results");

  resultArray.forEach(result => {
    const icon = result.isValid ? "✅" : "❌";
    const status = result.isValid ? "Valid" : "Invalid";

    console.group(`${icon} ${result.path} - ${status}`);

    if (!result.isValid && result.errors && result.errors.length > 0) {
      console.group(`Errors (${result.errors.length}):`);

      result.errors.forEach((error, index) => {
        console.group(`Error ${index + 1} of ${result.errors.length}`);

        const errorInfo = {
          Code: error.code,
          Message: error.message,
          Path: error.path,
        };

        if (error.details) {
          console.log("Details:", error.details);
        }

        console.table(errorInfo);
        console.groupEnd();
      });

      console.groupEnd();
    }

    if (result.value) {
      console.group("Validated Value:");
      console.dir(result.value, { depth: null });
      console.groupEnd();
    }

    console.groupEnd();
  });

  const summary = resultArray.reduce(
    (acc, curr) => ({
      total: acc.total + 1,
      valid: acc.valid + (curr.isValid ? 1 : 0),
      invalid: acc.invalid + (curr.isValid ? 0 : 1),
      totalErrors: acc.totalErrors + (curr.errors?.length || 0),
    }),
    { total: 0, valid: 0, invalid: 0, totalErrors: 0 }
  );

  console.log("Summary:", {
    "Total Validations": summary.total,
    "Valid": summary.valid,
    "Invalid": summary.invalid,
    "Total Errors": summary.totalErrors,
  });

  console.groupEnd();
};
