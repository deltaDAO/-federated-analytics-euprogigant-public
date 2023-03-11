import { Text } from '@mantine/core';
import React, { ReactElement } from 'react';

import { Carousel } from '../Carousel';
import { projectPartnersList } from './ProjectPartnersList';

import styles from './ProjectPartners.module.css';

export const ProjectPartners = (): ReactElement => {
  return (
    <div className={styles.container}>
      <Text className={styles.title} size="md">
        These partners work with us
      </Text>
      <Carousel show={4}>
        {projectPartnersList.map((logo) => (
          <div key={logo} className={styles.logoContainer}>
            <img src={logo} className={styles.logo} alt="Partner logo" />
          </div>
        ))}
      </Carousel>
      <div className={styles.footer}>
        <a href="https://euprogigant.com/partner/projektpartner/" target="_blank" rel="noopener noreferrer">
          All project partners
        </a>
      </div>
    </div>
  );
};
