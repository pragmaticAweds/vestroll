"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/input-field";
import Dropdown from "@/components/ui/dropdown";
import FileUpload from "@/components/ui/file-upload";

interface KybFormData {
  businessRegistrationType: string;
  businessRegistrationNo: string;
  incorporationCertificate: File | null;
  memorandumArticle: File | null;
  formC02C07: File | null;
}

const businessRegistrationTypes = [
  "Limited Liability Company (LLC)",
  "Corporation",
  "Partnership",
  "Sole Proprietorship",
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "S Corporation",
  "Non-Profit Corporation",
  "Professional Corporation",
  "Other",
];

export default function CompleteKYBPage() {
  const [formData, setFormData] = useState<KybFormData>({
    businessRegistrationType: "",
    businessRegistrationNo: "",
    incorporationCertificate: null,
    memorandumArticle: null,
    formC02C07: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof KybFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileSelect = (field: keyof KybFormData, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append("registrationType", formData.businessRegistrationType);
      submitData.append("registrationNo", formData.businessRegistrationNo);

      if (formData.incorporationCertificate) {
        submitData.append(
          "incorporationCertificate",
          formData.incorporationCertificate,
        );
      }
      if (formData.memorandumArticle) {
        submitData.append("memorandumArticle", formData.memorandumArticle);
      }
      if (formData.formC02C07) {
        submitData.append("formC02C07", formData.formC02C07);
      }

      const response = await fetch("/api/kyb/submit", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message);
        return;
      }

      // TODO: Handle success (show confirmation, update checklist state)
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Business Registration Type */}
        <Dropdown
          label="Business registration type"
          options={businessRegistrationTypes}
          value={formData.businessRegistrationType}
          onChange={(value) =>
            handleInputChange("businessRegistrationType", value)
          }
          placeholder="--"
        />

        {/* Business Registration Number */}
        <InputField
          id="businessRegistrationNo"
          label="Enter business registration No."
          type="text"
          placeholder="--"
          value={formData.businessRegistrationNo}
          onChange={(e) =>
            handleInputChange("businessRegistrationNo", e.target.value)
          }
        />

        {/* File Uploads */}
        <FileUpload
          key="incorporation-certificate"
          label="Upload Incorporation Certificate"
          onFileSelect={(file) =>
            handleFileSelect("incorporationCertificate", file)
          }
          file={formData.incorporationCertificate}
          accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
          maxSize={5}
          isUploading={isSubmitting}
          uploadProgress={0}
        />

        <FileUpload
          key="memorandum-article"
          label="Memorandum & Article of Association"
          onFileSelect={(file) => handleFileSelect("memorandumArticle", file)}
          file={formData.memorandumArticle}
          accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
          maxSize={5}
          isUploading={isSubmitting}
          uploadProgress={0}
        />

        <FileUpload
          key="form-c02-c07"
          label="Form C02/C07"
          onFileSelect={(file) => handleFileSelect("formC02C07", file)}
          file={formData.formC02C07}
          accept=".svg,.png,.jpg,.jpeg,.gif,.pdf"
          maxSize={5}
          isUploading={isSubmitting}
          uploadProgress={0}
        />

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={isSubmitting}
            className="w-full bg-[#5E2A8C] py-6 lg:h-[56px] mt-4 hover:bg-[#4A1F6F] text-white rounded-[12px]"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}
