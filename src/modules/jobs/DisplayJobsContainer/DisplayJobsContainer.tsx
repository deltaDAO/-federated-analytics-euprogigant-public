import { Accordion, createStyles, Text } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';

import { useWeb3 } from '@/modules/web3';
import { demoJobsList } from '../../../../demoJobsList';
import { FeltJobs } from '../FeltJob.types';
import { addNewFeltJob, readFeltJobs, removeFeltJob } from '../storage';
import { AccordionLabel } from './AccordionLabel';
import { DisplayJob } from './DisplayJob';

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor: '#fff',
    borderRadius: theme.radius.md,
    padding: 40,
  },
}));

export const DisplayJobsContainer = () => {
  const { accountId } = useWeb3();
  const { classes } = useStyles();
  const [jobs, setJobs] = useState<FeltJobs>({});

  const deleteJob = useCallback(
    (jobId: string) => {
      const newJobs = { ...jobs };
      delete newJobs[jobId];
      setJobs(newJobs);
      removeFeltJob(jobId);
    },
    [jobs]
  );

  const reloadJobsFromStorage = useCallback(() => {
    const demoJobs = demoJobsList[accountId] || demoJobsList[accountId?.toLowerCase()];
    const localStorageJobs = readFeltJobs();

    if (demoJobs) {
      Object.keys(demoJobs).forEach((jobId) => {
        if (localStorageJobs[jobId]) return;

        addNewFeltJob(demoJobs[jobId]);
      });
    }
    setJobs(readFeltJobs());
  }, [accountId]);

  useEffect(() => {
    reloadJobsFromStorage();
  }, [reloadJobsFromStorage]);

  if (Object.keys(jobs).length === 0)
    return (
      <div className={classes.root}>
        <Text>You have not started any jobs yet</Text>
      </div>
    );

  return (
    <div className={classes.root}>
      <Accordion chevronPosition="left">
        {/* keys are times -> jobs are displayed chronologically starting with the most recent one */}
        {Object.keys(jobs)
          .sort()
          .reverse()
          .map((jobId) => (
            <Accordion.Item key={jobId} value={jobId}>
              <Accordion.Control>
                <AccordionLabel
                  label={jobs[jobId].name}
                  date={jobs[jobId].createdAt}
                  deleteRow={() => deleteJob(jobId)}
                />
              </Accordion.Control>
              <Accordion.Panel>
                <DisplayJob job={jobs[jobId]} onReload={reloadJobsFromStorage} />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
      </Accordion>
    </div>
  );
};
