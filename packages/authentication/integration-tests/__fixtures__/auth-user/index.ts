import { SqlEntityManager } from "@mikro-orm/postgresql"
import { AuthUser } from "@models"

export async function createAuthUsers(
  manager: SqlEntityManager,
  userData: any[] = [
    {
      id: "test-id",
      entity_id: "test-id",
      provider: "manual",
    },
    {
      id: "test-id-1",
      entity_id: "test-id-1",
      provider: "manual",
    },
    {
      entity_id: "test-id-2",
      provider: "store",
    },
  ]
): Promise<AuthUser[]> {
  const authUsers: AuthUser[] = []

  for (const user of userData) {
    const authUser = manager.create(AuthUser, user)

    authUsers.push(authUser)
  }

  await manager.persistAndFlush(authUsers)

  return authUsers
}
