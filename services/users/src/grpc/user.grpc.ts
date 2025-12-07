import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { userService } from '../services/user.service';

// Proto file is in the service's proto directory (for isolated deployment)
const PROTO_PATH = path.resolve(__dirname, '../../proto/users.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const usersProto = grpc.loadPackageDefinition(packageDefinition) as any;

export function startGrpcServer(): void {
  const server = new grpc.Server();

  server.addService(usersProto.users.UserService.service, {
    createUser: async (call: any, callback: any) => {
      try {
        const { email, password, name } = call.request;
        const user = await userService.createUser({ email, password, name });
        callback(null, {
          id: user.id,
          email: user.email,
          name: user.name,
          success: true,
          message: 'User created successfully',
        });
      } catch (error: any) {
        callback(null, {
          id: '',
          email: '',
          name: '',
          success: false,
          message: error.message || 'Failed to create user',
        });
      }
    },

    login: async (call: any, callback: any) => {
      try {
        const { email, password } = call.request;
        const result = await userService.login({ email, password });
        callback(null, {
          token: result.token,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            success: true,
            message: 'Login successful',
          },
          success: true,
          message: 'Login successful',
        });
      } catch (error: any) {
        callback(null, {
          token: '',
          user: {
            id: '',
            email: '',
            name: '',
            success: false,
            message: error.message || 'Login failed',
          },
          success: false,
          message: error.message || 'Login failed',
        });
      }
    },

    validateUser: async (call: any, callback: any) => {
      try {
        const { userId } = call.request;
        const user = await userService.validateUser(userId);
        callback(null, {
          id: user.id,
          email: user.email,
          name: user.name,
          success: true,
          message: 'User validated',
        });
      } catch (error: any) {
        callback(null, {
          id: '',
          email: '',
          name: '',
          success: false,
          message: error.message || 'User validation failed',
        });
      }
    },

    getUserById: async (call: any, callback: any) => {
      try {
        const { userId } = call.request;
        const user = await userService.getUserById(userId);
        callback(null, {
          id: user.id,
          email: user.email,
          name: user.name,
          success: true,
          message: 'User found',
        });
      } catch (error: any) {
        callback(null, {
          id: '',
          email: '',
          name: '',
          success: false,
          message: error.message || 'User not found',
        });
      }
    },
  });

  const GRPC_PORT = process.env.GRPC_PORT || '50051';
  server.bindAsync(
    `0.0.0.0:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      if (error) {
        console.error('Failed to start gRPC server:', error);
        return;
      }
      server.start();
      console.log(`Users gRPC server running on port ${port}`);
    },
  );
}

