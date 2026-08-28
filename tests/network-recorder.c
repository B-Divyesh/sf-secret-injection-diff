#define _GNU_SOURCE

#include <dlfcn.h>
#include <fcntl.h>
#include <netdb.h>
#include <stdarg.h>
#include <stddef.h>
#include <stdlib.h>
#include <sys/socket.h>
#include <unistd.h>

static void record_call(const char *name) {
  const char *path = getenv("SID_NETWORK_LOG");
  if (path == NULL) return;
  int file = open(path, O_WRONLY | O_APPEND | O_CREAT, 0600);
  if (file < 0) return;
  dprintf(file, "%s\n", name);
  close(file);
}

int socket(int domain, int type, int protocol) {
  static int (*real_socket)(int, int, int) = NULL;
  record_call("socket");
  if (real_socket == NULL) real_socket = dlsym(RTLD_NEXT, "socket");
  return real_socket(domain, type, protocol);
}

int connect(int socket_fd, const struct sockaddr *address, socklen_t length) {
  static int (*real_connect)(int, const struct sockaddr *, socklen_t) = NULL;
  record_call("connect");
  if (real_connect == NULL) real_connect = dlsym(RTLD_NEXT, "connect");
  return real_connect(socket_fd, address, length);
}

ssize_t send(int socket_fd, const void *buffer, size_t length, int flags) {
  static ssize_t (*real_send)(int, const void *, size_t, int) = NULL;
  record_call("send");
  if (real_send == NULL) real_send = dlsym(RTLD_NEXT, "send");
  return real_send(socket_fd, buffer, length, flags);
}

ssize_t sendto(int socket_fd, const void *buffer, size_t length, int flags,
               const struct sockaddr *address, socklen_t address_length) {
  static ssize_t (*real_sendto)(int, const void *, size_t, int,
                                const struct sockaddr *, socklen_t) = NULL;
  record_call("sendto");
  if (real_sendto == NULL) real_sendto = dlsym(RTLD_NEXT, "sendto");
  return real_sendto(socket_fd, buffer, length, flags, address, address_length);
}

ssize_t sendmsg(int socket_fd, const struct msghdr *message, int flags) {
  static ssize_t (*real_sendmsg)(int, const struct msghdr *, int) = NULL;
  record_call("sendmsg");
  if (real_sendmsg == NULL) real_sendmsg = dlsym(RTLD_NEXT, "sendmsg");
  return real_sendmsg(socket_fd, message, flags);
}

int getaddrinfo(const char *node, const char *service,
                const struct addrinfo *hints, struct addrinfo **result) {
  static int (*real_getaddrinfo)(const char *, const char *,
                                 const struct addrinfo *, struct addrinfo **) = NULL;
  record_call("getaddrinfo");
  if (real_getaddrinfo == NULL) real_getaddrinfo = dlsym(RTLD_NEXT, "getaddrinfo");
  return real_getaddrinfo(node, service, hints, result);
}
