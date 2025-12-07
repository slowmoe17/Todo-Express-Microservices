import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

// Proto file is in the service's proto directory (for isolated deployment)
// This is a copy of the Users service proto file for client generation
const PROTO_PATH = path.resolve(__dirname, '../../proto/users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition) as any;

const USERS_GRPC_URL = process.env.USERS_GRPC_URL || 'localhost:50051';

class UserGrpcClient {
  private client: any;

  constructor() {
    this.client = new usersProto.users.UserService(
      USERS_GRPC_URL,
      grpc.credentials.createInsecure(),
    );
  }

  async validateUser(userId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      this.client.validateUser({ userId }, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }

  async getUserById(userId: string): Promise<{ id: string; email: string; name: string; success: boolean }> {
    return new Promise((resolve, reject) => {
      this.client.getUserById({ userId }, (error: any, response: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(response);
      });
    });
  }
}

export const userGrpcClient = new UserGrpcClient();

