import { PingContract } from './contracts/PingContrac';
import { AdminContract } from './contracts/AdminContract';
import { ProducerContract } from './contracts/ProducerContract';
import { TransportContract } from './contracts/TransportContract';
import { ProcessorContract } from './contracts/ProcessorContract';

export const contracts: any[] = [
  PingContract,
  AdminContract,
  ProducerContract,
  TransportContract,
  ProcessorContract
];
//export const contracts: any[] = [PingContract];