import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { Config } from '@backstage/config';
import { LoggerService } from '@backstage/backend-plugin-api';
import fetch from 'node-fetch';
import { z } from 'zod';

interface ActionOptions {
  config: Config;
  logger: LoggerService;
}

export function createRundeckExecuteAction(options: ActionOptions) {
  const { config } = options;

  return createTemplateAction<{
    jobId: string;
    projectName: string;
    parameters?: Record<string, string>;
    waitForJob?: boolean;
    timeout?: number;
  }>({
    id: 'rundeck:job:execute',
    description: 'Executes a Rundeck job with optional parameters and wait for completion',
    schema: {
      input: z.object({
        jobId: z.string().describe('The Rundeck job ID or UUID'),
        projectName: z.string().describe('The Rundeck project name'),
        parameters: z.record(z.string()).optional().describe('Job parameters as key-value pairs'),
        waitForJob: z.boolean().optional().default(false).describe('Wait for job completion before continuing'),
        timeout: z.number().optional().default(300).describe('Timeout in seconds when waiting for job completion'),
      }),
    },
    async handler(ctx) {
      const { jobId, projectName, parameters = {}, waitForJob = false, timeout = 300 } = ctx.input;
      
      try {
        // Get Rundeck configuration from app-config.yaml
        const rundeckUrl = config.getString('rundeck.url');
        const apiToken = config.getString('rundeck.apiToken');
        
        if (!rundeckUrl || !apiToken) {
          throw new Error('Rundeck URL and API token must be configured in app-config.yaml');
        }

        
        // Build the execution request
        const executionData: any = {
          project: projectName,
        };

        // Add options if parameters are provided
        if (Object.keys(parameters).length > 0) {
          executionData.options = parameters;
        }

        // Execute the job
        const response = await fetch(
          `${rundeckUrl}/api/18/job/${jobId}/executions`,
          {
            method: 'POST',
            headers: {
              'X-Rundeck-Auth-Token': apiToken,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(executionData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to execute Rundeck job: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json() as any;
        const executionId = result.id;
        
        
        ctx.output('executionId', executionId);
        ctx.output('rundeckUrl', `${rundeckUrl}/project/${projectName}/execution/show/${executionId}`);

        if (waitForJob) {
          
          const startTime = Date.now();
          let status = 'running';
          
          while ((status === 'running' || status === 'scheduled' || status === 'queued') && (Date.now() - startTime) < timeout * 1000) {
            // Wait 5 seconds before checking status
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            const statusResponse = await fetch(
              `${rundeckUrl}/api/18/execution/${executionId}`,
              {
                headers: {
                  'X-Rundeck-Auth-Token': apiToken,
                  'Accept': 'application/json',
                },
              }
            );

            if (statusResponse.ok) {
              const statusData = await statusResponse.json() as any;
              status = statusData.status;
            } else {
              ctx.logger?.warn(`Failed to check job status: ${statusResponse.status}`);
            }
          }
          
          if (status === 'running' || status === 'scheduled' || status === 'queued') {
            ctx.output('status', 'timeout');
          } else {
            ctx.output('status', status);
            
            // Fetch execution logs
            try {
              let logResponse = await fetch(
                `${rundeckUrl}/api/18/execution/${executionId}/output?format=json`,
                {
                  headers: {
                    'X-Rundeck-Auth-Token': apiToken,
                    'Accept': 'application/json',
                  },
                }
              );
              
              let logs = '';
              
              if (logResponse.ok) {
                const logData = await logResponse.json() as any;
                
                // Try multiple possible response formats
                if (logData.entries && Array.isArray(logData.entries)) {
                  logs = logData.entries.map((entry: any) => entry.log || entry.message || entry.content || entry.text).join('\n');
                } else if (logData.output) {
                  logs = logData.output;
                } else if (logData.log) {
                  logs = logData.log;
                } else if (typeof logData === 'string') {
                  logs = logData;
                } else {
                  logs = JSON.stringify(logData, null, 2);
                }
              } else {
                // Fallback to text format
                logResponse = await fetch(
                  `${rundeckUrl}/api/18/execution/${executionId}/output`,
                  {
                    headers: {
                      'X-Rundeck-Auth-Token': apiToken,
                      'Accept': 'text/plain',
                    },
                  }
                );
                
                if (logResponse.ok) {
                  logs = await logResponse.text();
                }
              }
              
              ctx.output('logs', logs);
              
            } catch (logError) {
              ctx.output('logs', '');
            }
            
            if (status === 'failed') {
              throw new Error(`Rundeck job execution failed with status: ${status}`);
            }
          }
        } else {
          ctx.output('status', 'started');
        }

      } catch (error) {
        ctx.logger?.error(`Error executing Rundeck job: ${error}`);
        throw error;
      }
    },
  });
}