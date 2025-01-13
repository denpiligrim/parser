import React, { useState } from 'react';
import { Box, Button, CircularProgress, FormControl, MenuItem, Select, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';

const steps = [
  'Ввод данных',
  'Получение информации',
  'Редактирование',
  'Выгрузка в файл',
];

const Main: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [donor, setDonor] = useState('21vek.by');
  const [links, setLinks] = useState('');

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setActiveStep((prevStep) => prevStep + 1);
      }, 2000); // Имитация загрузки

    }
  };

  const changeDonor = (e: any) => {
    const value = e.target.value;
    if (value !== donor) {
      setActiveStep(0);
      setDonor(value);
    }
  }
  const changeLinks = (e: any) => {
    const value = e.target.value;
    setLinks(value);
  }

  return (
    <Box height="auto" minHeight='100vh'>
      <Box sx={{ textAlign: 'right' }}>
        <FormControl variant='filled' sx={{ minWidth: 130 }} size="small">
          <Select
            value={donor}
            label="Сайт-донор"
            onChange={changeDonor}
          >
            <MenuItem value={'21vek.by'}>21vek.by</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box p={3}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={4}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" height="200px">
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Box>
                <Typography variant='h5' component='h1'>Введите ссылки на категории товаров</Typography>
                <Typography variant='caption' component='p' color='textSecondary'>(через запятую или с новой строки)</Typography>
                <TextField
                  label="Ссылки на категории"
                  value={links}
                  onChange={changeLinks}
                  multiline
                  sx={{
                    width: '100%',
                    maxWidth: '500px',
                    my: 4,
                    backgroundColor: 'white'
                  }}
                />
              </Box>
              <Box mt={2} sx={{ textAlign: 'center' }}>
                {activeStep < steps.length - 1 && (
                  <Button disabled={links.length === 0} variant="contained" onClick={handleNext}>
                    Далее
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Main;