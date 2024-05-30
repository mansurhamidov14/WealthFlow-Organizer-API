import { ExecutionContext, NotFoundException, createParamDecorator } from "@nestjs/common";

export const NumParam = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const result = Number(request.params[data]);

  if (isNaN(result)) {
    throw new NotFoundException();
  }

  return result;
})