'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KestraService } from '@/lib/kestra/kestraService';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from "@/components/ui/use-toast";

interface WorkflowConfigurationProps {
  automationId: string;
  configurationSchema: any;
  kestraNamespace: string;
  kestraFlowId: string;
}

export function WorkflowConfiguration({ 
  automationId, 
  configurationSchema, 
  kestraNamespace,
  kestraFlowId 
}: WorkflowConfigurationProps) {
  const supabase = createClientComponentClient();
  const kestraService = new KestraService();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamically generate Zod schema
  const generateZodSchema = (schema: any) => {
    const zodSchemaObject: any = {};
    
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      let validator = z.string().min(1, `${key} is required`);
      
      switch (prop.type) {
        case 'number':
          validator = z.coerce.number();
          break;
        case 'boolean':
          validator = z.boolean();
          break;
      }
      
      zodSchemaObject[key] = validator;
    });
    
    return z.object(zodSchemaObject);
  };

  const FormSchema = generateZodSchema(configurationSchema);
  type FormData = z.infer<typeof FormSchema>;

  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema)
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please log in to start the workflow",
          variant: "destructive"
        });
        return;
      }

      // Start Kestra workflow
      const execution = await kestraService.startExecution({
        namespace: kestraNamespace,
        flowId: kestraFlowId,
        inputs: {
          ...data,
          user_id: user.id
        }
      });

      // Save to user_automations
      const { error } = await supabase
        .from('user_automations')
        .upsert({
          user_id: user.id,
          automation_id: automationId,
          configuration: data,
          kestra_execution_id: execution.id,
          last_run_status: 'RUNNING'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Workflow Started",
        description: `Workflow ${kestraFlowId} has been initiated successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error('Workflow start failed:', error);
      toast({
        title: "Workflow Start Error",
        description: "Failed to start the workflow. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic form field rendering
  const renderFormField = (key: string, prop: any) => {
    switch (prop.type) {
      case 'string':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {prop.title || key}
                </label>
                <Input 
                  {...field} 
                  placeholder={prop.description || key}
                  className="w-full"
                />
                {errors[key] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[key]?.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );
      case 'number':
        return (
          <Controller
            name={key}
            control={control}
            render={({ field }) => (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {prop.title || key}
                </label>
                <Input 
                  {...field} 
                  type="number"
                  placeholder={prop.description || key}
                  className="w-full"
                />
                {errors[key] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[key]?.message as string}
                  </p>
                )}
              </div>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configure Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          {Object.entries(configurationSchema.properties).map(([key, prop]: [string, any]) => (
            <div key={key}>
              {renderFormField(key, prop)}
            </div>
          ))}
          <Button 
            type="submit" 
            className="w-full mt-4" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Starting Workflow...' : 'Start Workflow'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
