'use client';

import { useTransition, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, type CustomerFormInput } from '../schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, User, Landmark, ShieldAlert, FileDigit } from 'lucide-react';

interface CustomerFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

export function CustomerForm({ initialData, onSubmit, isSubmitting = false }: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      fullName: '',
      phone: '',
      altPhone: '',
      email: '',
      dob: '',
      address: '',
      occupation: '',
      monthlyIncome: '0',
      notes: '',
      identityDocuments: [],
      bankDetails: [],
      guarantors: [],
    },
  });

  // Dynamic arrays
  const { fields: idFields, append: appendId, remove: removeId } = useFieldArray({
    control,
    name: 'identityDocuments',
  });

  const { fields: bankFields, append: appendBank, remove: removeBank } = useFieldArray({
    control,
    name: 'bankDetails',
  });

  const { fields: guarantorFields, append: appendGuarantor, remove: removeGuarantor } = useFieldArray({
    control,
    name: 'guarantors',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 p-1.5 rounded-xl h-14">
          <TabsTrigger value="basic" className="rounded-lg py-2.5 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="rounded-lg py-2.5 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <FileDigit className="w-4 h-4" />
            <span>Identity KYC</span>
          </TabsTrigger>
          <TabsTrigger value="bank" className="rounded-lg py-2.5 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Landmark className="w-4 h-4" />
            <span>Bank Account</span>
          </TabsTrigger>
          <TabsTrigger value="guarantor" className="rounded-lg py-2.5 text-xs font-semibold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
            <ShieldAlert className="w-4 h-4" />
            <span>Guarantors</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. Basic Info Tab */}
        <TabsContent value="basic" className="mt-6">
          <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-foreground text-base">Basic Profile Details</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Enter full name, contact details, and monthly income parameters.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Full Name *</Label>
                <Input id="fullName" placeholder="Jane Doe" {...register('fullName')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
                {errors.fullName && <p className="text-[11px] text-destructive font-medium">{errors.fullName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Phone Number *</Label>
                <Input id="phone" placeholder="9876543210" {...register('phone')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
                {errors.phone && <p className="text-[11px] text-destructive font-medium">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="altPhone" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Alternative Phone</Label>
                <Input id="altPhone" placeholder="optional" {...register('altPhone')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Email Address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
                {errors.email && <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dob" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Date of Birth</Label>
                <Input id="dob" type="date" {...register('dob')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="occupation" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Occupation</Label>
                <Input id="occupation" placeholder="Software Engineer" {...register('occupation')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="monthlyIncome" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Monthly Income (INR)</Label>
                <Input id="monthlyIncome" type="number" placeholder="50000" {...register('monthlyIncome')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
                {errors.monthlyIncome && <p className="text-[11px] text-destructive font-medium">{errors.monthlyIncome.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Permanent Address *</Label>
                <Input id="address" placeholder="123 Main St, New Delhi, India" {...register('address')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
                {errors.address && <p className="text-[11px] text-destructive font-medium">{errors.address.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="notes" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Reference Notes</Label>
                <Input id="notes" placeholder="Any additional customer profiling information" {...register('notes')} className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. KYC Tab */}
        <TabsContent value="kyc" className="mt-6">
          <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-base">Identity KYC Documents</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Add Aadhaar, PAN Card, passport details, or other proofs.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendId({ docType: 'aadhaar', docNumber: '', fileUrl: '' })} className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white">
                <Plus className="w-4 h-4" /> Add Document
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {idFields.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No KYC documents added yet. Click "Add Document" to add Aadhaar, PAN, etc.
                </div>
              )}
              {idFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 relative">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Document Type</Label>
                    <Controller
                      control={control}
                      name={`identityDocuments.${index}.docType`}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                            <SelectItem value="aadhaar">Aadhaar Card</SelectItem>
                            <SelectItem value="pan">PAN Card</SelectItem>
                            <SelectItem value="voter_id">Voter ID</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="other">Other ID</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Document/ID Number *</Label>
                    <Input placeholder="Number" {...register(`identityDocuments.${index}.docNumber` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5 flex items-end gap-2">
                    <div className="flex-grow">
                      <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Proof Link / URL</Label>
                      <Input placeholder="https://..." {...register(`identityDocuments.${index}.fileUrl` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                    </div>
                    {idFields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeId(index)} className="shrink-0 h-10 w-10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Bank details Tab */}
        <TabsContent value="bank" className="mt-6">
          <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-base">Bank Payout Accounts</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Enter checking/savings accounts for loan disbursement and UPI mapping.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendBank({ bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '', upiId: '', isPrimary: false })} className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white">
                <Plus className="w-4 h-4" /> Add Account
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {bankFields.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No bank accounts added yet. Click "Add Account" to add payment details.
                </div>
              )}
              {bankFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 relative">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Bank Name *</Label>
                    <Input placeholder="HDFC Bank" {...register(`bankDetails.${index}.bankName` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Account Holder Name *</Label>
                    <Input placeholder="Jane Doe" {...register(`bankDetails.${index}.accountHolderName` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Account Number *</Label>
                    <Input placeholder="50100234567" {...register(`bankDetails.${index}.accountNumber` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">IFSC Code *</Label>
                    <Input placeholder="HDFC0000240" {...register(`bankDetails.${index}.ifscCode` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">UPI ID (optional)</Label>
                    <Input placeholder="jane@okhdfc" {...register(`bankDetails.${index}.upiId` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5 flex items-center justify-between pt-6 px-2">
                    <div className="flex items-center space-x-2">
                      <Controller
                        control={control}
                        name={`bankDetails.${index}.isPrimary`}
                        render={({ field }) => (
                          <Checkbox
                            id={`bankDetails.${index}.isPrimary`}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-input data-[state=checked]:bg-primary"
                          />
                        )}
                      />
                      <label htmlFor={`bankDetails.${index}.isPrimary`} className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        Primary Account
                      </label>
                    </div>
                    {bankFields.length > 1 && (
                      <Button type="button" variant="destructive" size="icon" onClick={() => removeBank(index)} className="h-9 w-9">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Guarantors Tab */}
        <TabsContent value="guarantor" className="mt-6">
          <Card className="bg-slate-50/50 dark:bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground text-base">Loan Guarantor References</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">Add co-signers, family references, or friends linked to this customer account.</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => appendGuarantor({ fullName: '', phone: '', address: '', relation: '', idProofType: 'Aadhaar', idProofNumber: '', idProofUrl: '' })} className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-white">
                <Plus className="w-4 h-4" /> Add Guarantor
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {guarantorFields.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  No guarantors added yet. You can optionally add references for collateral verification.
                </div>
              )}
              {guarantorFields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-50 dark:bg-slate-950/40 relative">
                  <Button type="button" variant="destructive" size="icon" onClick={() => removeGuarantor(index)} className="absolute top-2 right-2 h-7 w-7">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Full Name *</Label>
                    <Input placeholder="John Doe" {...register(`guarantors.${index}.fullName` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Phone Number *</Label>
                    <Input placeholder="9876543210" {...register(`guarantors.${index}.phone` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Relation</Label>
                    <Input placeholder="Spouse, Father, Business Partner" {...register(`guarantors.${index}.relation` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">ID Proof Type / Number</Label>
                    <div className="flex gap-2">
                      <Input placeholder="Aadhaar" {...register(`guarantors.${index}.idProofType` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 w-1/3" />
                      <Input placeholder="ID Number" {...register(`guarantors.${index}.idProofNumber` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex-grow" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-slate-700 dark:text-slate-300 text-xs font-semibold">Permanent Address</Label>
                    <Input placeholder="Address" {...register(`guarantors.${index}.address` as const)} className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 border-t border-slate-850 pt-6">
        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/95 text-white font-semibold px-6 shadow-sm">
          {isSubmitting ? 'Saving Customer...' : 'Save Customer Profile'}
        </Button>
      </div>
    </form>
  );
}
