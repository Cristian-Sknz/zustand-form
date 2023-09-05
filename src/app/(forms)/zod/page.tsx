'use client';
import React, { useId } from 'react';
import { useForm } from '@/hook/form';
import { z } from 'zod';
import { Button, Code, FormControl, FormLabel, Heading, Input, Text, VStack } from '@chakra-ui/react'
import FormController from '@/hook/controller';

const REQUIRED_MESSAGE = { required_error: 'Este campo é obrigatório.' };

const Scheme = z.object({
  username: z.string(REQUIRED_MESSAGE),
  email: z.string(REQUIRED_MESSAGE).email('Insira um email valido.'),
  idade: z.object({
    numero: z.coerce.number(REQUIRED_MESSAGE)
      .positive('Coloque um numero positivo que não seja zero.').default(18)
  })
});

const esquema = z.object({
  casa: z.object({
    aquecedor: z.object({
      ligado: z.boolean()
    })
  }),
  familia: z.string().default('cu')
});

export default function Home() {
  const id = useId();
  const { control, register, handleSubmit, watch, error } = useForm(Scheme);

  return (
    <VStack p={15} bg={'black'} alignItems={'center'} justifyContent={'center'} w={'full'} h={'100vh'}>
      <VStack alignItems={'center'} justifyContent={'center'} p={1} shadow={'0px 0px 8px #ffffff85'} dropShadow={''} w={'full'} h={'full'}>
        <Heading color={'white'}>{id}</Heading>
        <FormControl w={'sm'}>
          <FormLabel color={'white'}>Nome</FormLabel>
          <FormController name={'username'} control={control} render={(props) => (
            <Input isInvalid={!!props.error} autoComplete='false' color={'white'} value={props.value} onChange={(e) => props.setValue(e.currentTarget.value)}></Input>
          )}/>
          <ErrorWatch name={'username'} error={error}/>
        </FormControl>

        <FormControl w={'sm'}>
          <FormLabel color={'white'}>Email</FormLabel>
          <Input autoComplete='false' {...register('email')} type={'email'} color={'white'}></Input>
          <ErrorWatch name={'email'} error={error}/>
        </FormControl>    

        <FormControl w={'sm'}>
          <FormLabel color={'white'}>Idade</FormLabel>
          <Input autoComplete='false' {...register('idade.numero')} type='number' color={'white'}></Input>
          <ErrorWatch name={'idade.numero'} error={error}/>
        </FormControl>

        <Button onClick={handleSubmit((e) => console.log(e))}>Submit</Button>
        <CodeWatch watch={watch}/>
      </VStack>
    </VStack>
  )
}

type ErrorWatchProps = {
  name: string;
  error: ReturnType<typeof useForm<typeof Scheme>>['error'];
}

const ErrorWatch: React.FC<ErrorWatchProps> = (props) => {
  const value = props.error(props.name as any)

  return <>{value?.message && 
    <Text textAlign={'center'} color={'red.400'} fontSize={'sm'}>
      {value.message}
    </Text>
  }</>
}


type WatchSobrenomeProps = {
  watch: ReturnType<typeof useForm<typeof Scheme>>['watch'];
}

const CodeWatch: React.FC<WatchSobrenomeProps> = ({ watch }) => {
  return <Code>{JSON.stringify(watch(), null, 2)}</Code>
}